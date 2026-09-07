interface MockedApi {
  decryptText: (text: string, type?: string) => Promise<string>;
  processProtectedElements: () => void;
  processElement: (el: HTMLElement) => void;
  initProtection: () => void;
}

type IntersectionCallback = (
  entries: Array<{ isIntersecting: boolean; target: Element }>,
  observer: { unobserve: (el: Element) => void }
) => void;

let intersectionCallback: IntersectionCallback | null = null;
let observeSpy: jest.Mock;
let unobserveSpy: jest.Mock;

function mockIntersectionObserver() {
  observeSpy = jest.fn();
  unobserveSpy = jest.fn();

  class MockIntersectionObserver {
    constructor(cb: IntersectionCallback) {
      intersectionCallback = cb;
    }
    observe = observeSpy;
    unobserve = unobserveSpy;
    disconnect = jest.fn();
  }

  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    MockIntersectionObserver;
}

function mockFetchSequence(responses: Array<{ ok: boolean; json: unknown; status?: number }>) {
  const fetchMock = jest.fn();
  responses.forEach((response) => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: response.ok,
        status: response.status ?? 200,
        json: () => Promise.resolve(response.json),
      })
    );
  });
  (global as unknown as { fetch: unknown }).fetch = fetchMock;
  return fetchMock;
}

function buildProtectedElement(content = "encrypted-payload") {
  document.body.innerHTML = "";
  const el = document.createElement("div");
  el.setAttribute("data-protected", "true");
  el.setAttribute("data-original-content", content);
  el.setAttribute("data-protection-type", "text");
  document.body.append(el);
  return el;
}

function loadModule(): MockedApi {
  jest.resetModules();
  intersectionCallback = null;
  require("./protected-content");
  return (window as unknown as { kotlinskidevProtection: MockedApi }).kotlinskidevProtection;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("protected-content.ts", () => {
  let clickListeners: EventListener[];
  const originalAddEventListener = document.addEventListener.bind(document);

  beforeEach(() => {
    mockIntersectionObserver();

    clickListeners = [];
    jest.spyOn(document, "addEventListener").mockImplementation((type, listener, options) => {
      if (type === "click") {
        clickListeners.push(listener as EventListener);
      }
      return originalAddEventListener(type, listener as EventListener, options);
    });
  });

  afterEach(() => {
    clickListeners.forEach((listener) => document.removeEventListener("click", listener));
    jest.restoreAllMocks();
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
    delete (global as unknown as { fetch?: unknown }).fetch;
    delete (window as unknown as { kotlinskidevProtectionConfig?: unknown })
      .kotlinskidevProtectionConfig;
    document.body.innerHTML = "";
  });

  it("observes every element with data-protected=true on init", () => {
    buildProtectedElement();

    loadModule();

    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it("warns and does not enqueue an element with no original content data", () => {
    document.body.innerHTML = "";
    const el = document.createElement("div");
    el.setAttribute("data-protected", "true");
    document.body.append(el);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const api = loadModule();

    api.processElement(el);
    intersectionCallback?.([{ isIntersecting: true, target: el }], { unobserve: unobserveSpy });

    expect(warnSpy).toHaveBeenCalledWith("Protected element missing original content data");
    warnSpy.mockRestore();
  });

  it("unobserves the element as soon as it intersects", () => {
    const el = buildProtectedElement();
    loadModule();

    intersectionCallback?.([{ isIntersecting: true, target: el }], { unobserve: unobserveSpy });

    expect(unobserveSpy).toHaveBeenCalledWith(el);
  });

  it("shows a loading spinner once the debounced batch flush starts", async () => {
    const el = buildProtectedElement();
    (global as unknown as { fetch: unknown }).fetch = jest.fn(() => new Promise(() => {}));
    loadModule();

    intersectionCallback?.([{ isIntersecting: true, target: el }], { unobserve: unobserveSpy });
    await wait(60);

    expect(el.classList.contains("protection-loading")).toBe(true);
  });

  it("reveals the decrypted content after a successful fetch", async () => {
    const el = buildProtectedElement();
    mockFetchSequence([
      {
        ok: true,
        json: {
          success: true,
          data: { results: { 0: { content: "<p>Hi</p>", raw_content: "Hi" } } },
        },
      },
    ]);
    loadModule();

    intersectionCallback?.([{ isIntersecting: true, target: el }], { unobserve: unobserveSpy });
    await wait(60);

    expect(el.innerHTML).toBe("<p>Hi</p>");
    expect(el.classList.contains("protection-loaded")).toBe(true);
    expect(el.hasAttribute("data-original-content")).toBe(false);
  });

  it("shows an error state when the batch fetch fails", async () => {
    const el = buildProtectedElement();
    mockFetchSequence([{ ok: false, json: {}, status: 500 }]);
    loadModule();
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    intersectionCallback?.([{ isIntersecting: true, target: el }], { unobserve: unobserveSpy });
    await wait(60);

    expect(el.classList.contains("protection-error")).toBe(true);
    expect(el.getAttribute("aria-label")).toBe("Failed to load protected text content");
    errorSpy.mockRestore();
  });

  it("batches multiple elements that intersect within the debounce window into one request", async () => {
    document.body.innerHTML = "";
    const elA = buildProtectedElement("a-content");
    const elB = document.createElement("div");
    elB.setAttribute("data-protected", "true");
    elB.setAttribute("data-original-content", "b-content");
    document.body.append(elB);
    const fetchMock = mockFetchSequence([
      {
        ok: true,
        json: {
          success: true,
          data: {
            results: {
              0: { content: "A", raw_content: "a" },
              1: { content: "B", raw_content: "b" },
            },
          },
        },
      },
    ]);
    loadModule();

    intersectionCallback?.(
      [
        { isIntersecting: true, target: elA },
        { isIntersecting: true, target: elB },
      ],
      { unobserve: unobserveSpy }
    );
    await wait(60);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const items = JSON.parse((fetchMock.mock.calls[0][1].body as FormData).get("items") as string);
    expect(items).toHaveLength(2);
  });

  it("retries once with a refreshed nonce when the server reports an expired nonce", async () => {
    const el = buildProtectedElement();
    (window as unknown as { kotlinskidevProtectionConfig: unknown }).kotlinskidevProtectionConfig =
      {
        ajaxUrl: "/wp-admin/admin-ajax.php",
        nonce: "stale-nonce",
        errorText: "Failed to load protected content",
      };
    mockFetchSequence([
      { ok: true, json: { success: false, data: { error_code: "nonce_expired" } } },
      { ok: true, json: { success: true, data: { nonce: "fresh-nonce" } } },
      {
        ok: true,
        json: {
          success: true,
          data: { results: { 0: { content: "<p>Ok</p>", raw_content: "Ok" } } },
        },
      },
    ]);
    loadModule();

    intersectionCallback?.([{ isIntersecting: true, target: el }], { unobserve: unobserveSpy });
    await wait(80);

    expect(el.innerHTML).toBe("<p>Ok</p>");
  });

  it("decryptText resolves the raw content for a single item", async () => {
    mockFetchSequence([
      {
        ok: true,
        json: {
          success: true,
          data: { results: { 0: { content: "<p>X</p>", raw_content: "X" } } },
        },
      },
    ]);
    const api = loadModule();

    await expect(api.decryptText("cipher")).resolves.toBe("X");
  });

  it("decryptText rejects when the response has no matching result", async () => {
    mockFetchSequence([{ ok: true, json: { success: true, data: { results: {} } } }]);
    const api = loadModule();

    await expect(api.decryptText("cipher")).rejects.toThrow("Unknown decryption error");
  });

  it("observes elements added later via a DOM mutation", async () => {
    document.body.innerHTML = "";
    loadModule();
    observeSpy.mockClear();

    const el = document.createElement("div");
    el.setAttribute("data-protected", "true");
    el.setAttribute("data-original-content", "later-content");
    document.body.append(el);
    await wait(10);

    expect(observeSpy).toHaveBeenCalledWith(el);
  });

  describe("copy-to-clipboard button", () => {
    let writeTextSpy: jest.Mock;

    function buildCopyButton() {
      document.body.innerHTML = `
        <button
          class="kt-copy-btn kt-tooltip"
          data-copy-value="hello@example.test"
          data-tooltip="Copy to clipboard"
          data-copy-label="Copy to clipboard"
          data-copied-label="Copied to clipboard"
          aria-label="Copy to clipboard"
        ></button>
      `;
      return document.querySelector<HTMLButtonElement>(".kt-copy-btn")!;
    }

    beforeEach(() => {
      writeTextSpy = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });
    });

    it("copies the button's data-copy-value to the clipboard", async () => {
      const button = buildCopyButton();
      loadModule();

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(10);

      expect(writeTextSpy).toHaveBeenCalledWith("hello@example.test");
    });

    it("switches to the translated copied-label and shows the tooltip on success", async () => {
      const button = buildCopyButton();
      loadModule();

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(10);

      expect(button.classList.contains("kt-copy-btn--copied")).toBe(true);
      expect(button.classList.contains("kt-tooltip--visible")).toBe(true);
      expect(button.getAttribute("aria-label")).toBe("Copied to clipboard");
      expect(button.getAttribute("data-tooltip")).toBe("Copied to clipboard");
    });

    it("reverts to the copy-label and hides the tooltip after the feedback window", async () => {
      const button = buildCopyButton();
      loadModule();

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(1600);

      expect(button.classList.contains("kt-copy-btn--copied")).toBe(false);
      expect(button.classList.contains("kt-tooltip--visible")).toBe(false);
      expect(button.getAttribute("aria-label")).toBe("Copy to clipboard");
      expect(button.getAttribute("data-tooltip")).toBe("Copy to clipboard");
    }, 10000);

    it("does not revert early when clicked again before the feedback window elapses", async () => {
      const button = buildCopyButton();
      loadModule();

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(1000);
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(1000);

      expect(button.classList.contains("kt-copy-btn--copied")).toBe(true);
      expect(button.getAttribute("data-tooltip")).toBe("Copied to clipboard");
    }, 10000);

    it("falls back to execCommand copy when the Clipboard API write fails, still showing success", async () => {
      const button = buildCopyButton();
      writeTextSpy.mockRejectedValueOnce(new Error("denied"));
      const execCommandSpy = jest.fn().mockReturnValue(true);
      Object.assign(document, { execCommand: execCommandSpy });
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      loadModule();

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(10);

      expect(execCommandSpy).toHaveBeenCalledWith("copy");
      expect(button.classList.contains("kt-copy-btn--copied")).toBe(true);
      expect(button.getAttribute("data-tooltip")).toBe("Copied to clipboard");
      errorSpy.mockRestore();
      execCommandSpy.mockRestore();
    });

    it("falls back to execCommand copy when navigator.clipboard is unavailable", async () => {
      const button = buildCopyButton();
      Object.assign(navigator, { clipboard: undefined });
      const execCommandSpy = jest.fn().mockReturnValue(true);
      Object.assign(document, { execCommand: execCommandSpy });
      loadModule();

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(10);

      expect(execCommandSpy).toHaveBeenCalledWith("copy");
      expect(button.classList.contains("kt-copy-btn--copied")).toBe(true);
      execCommandSpy.mockRestore();
    });

    it("does not show copied feedback when both the Clipboard API and execCommand fail", async () => {
      const button = buildCopyButton();
      writeTextSpy.mockRejectedValueOnce(new Error("denied"));
      const execCommandSpy = jest.fn().mockReturnValue(false);
      Object.assign(document, { execCommand: execCommandSpy });
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      loadModule();

      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await wait(10);

      expect(button.classList.contains("kt-copy-btn--copied")).toBe(false);
      expect(button.getAttribute("data-tooltip")).toBe("Copy to clipboard");
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
      execCommandSpy.mockRestore();
    });
  });
});
