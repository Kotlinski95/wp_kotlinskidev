function loadScript() {
  jest.resetModules();
  require("./line-clamp");
}

function setDimensions(el: Element, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: clientHeight });
}

describe("line-clamp.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    delete window.i18n;
  });

  it("does nothing when there is no line-clamp toggle on the page", () => {
    document.body.innerHTML = "<p>no truncation here</p>";

    expect(() => loadScript()).not.toThrow();
  });

  it("hides the toggle when the paragraph text does not actually overflow", () => {
    document.body.innerHTML =
      '<p class="kt-line-clamp">Short text</p><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';
    setDimensions(document.querySelector("p")!, 40, 60);

    loadScript();

    expect(document.querySelector(".kt-line-clamp-toggle")).toHaveClass(
      "kt-line-clamp-toggle--hidden"
    );
  });

  it("keeps the toggle visible when the paragraph text overflows", () => {
    document.body.innerHTML =
      '<p class="kt-line-clamp">Long text</p><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';
    setDimensions(document.querySelector("p")!, 120, 60);

    loadScript();

    expect(document.querySelector(".kt-line-clamp-toggle")).not.toHaveClass(
      "kt-line-clamp-toggle--hidden"
    );
  });

  it("expands the paragraph and swaps the label on click", () => {
    document.body.innerHTML =
      '<p class="kt-line-clamp">Long text</p><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';
    setDimensions(document.querySelector("p")!, 120, 60);
    window.i18n = { general: { read_more: "Read more", read_less: "Read less" } };

    loadScript();
    const toggle = document.querySelector(".kt-line-clamp-toggle") as HTMLButtonElement;
    toggle.click();

    expect(document.querySelector("p")).toHaveClass("kt-line-clamp--expanded");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.textContent).toBe("Read less");
  });

  it("collapses the paragraph and restores the label on a second click", () => {
    document.body.innerHTML =
      '<p class="kt-line-clamp">Long text</p><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';
    setDimensions(document.querySelector("p")!, 120, 60);
    window.i18n = { general: { read_more: "Read more", read_less: "Read less" } };

    loadScript();
    const toggle = document.querySelector(".kt-line-clamp-toggle") as HTMLButtonElement;
    toggle.click();
    toggle.click();

    expect(document.querySelector("p")).not.toHaveClass("kt-line-clamp--expanded");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.textContent).toBe("Read more");
  });

  it("uses the localized strings from window.i18n when present", () => {
    document.body.innerHTML =
      '<p class="kt-line-clamp">Long text</p><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';
    setDimensions(document.querySelector("p")!, 120, 60);
    window.i18n = { general: { read_more: "Pokaz więcej", read_less: "Pokaz mniej" } };

    loadScript();
    const toggle = document.querySelector(".kt-line-clamp-toggle") as HTMLButtonElement;
    toggle.click();

    expect(toggle.textContent).toBe("Pokaz mniej");
  });

  it("falls back to the English default label when window.i18n is unavailable", () => {
    document.body.innerHTML =
      '<p class="kt-line-clamp">Long text</p><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';
    setDimensions(document.querySelector("p")!, 120, 60);

    loadScript();
    const toggle = document.querySelector(".kt-line-clamp-toggle") as HTMLButtonElement;
    toggle.click();

    expect(toggle.textContent).toBe("Read less");
  });

  it("uses ResizeObserver to detect overflow once layout settles, when available", () => {
    document.body.innerHTML =
      '<p class="kt-line-clamp">Long text</p><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';
    const paragraph = document.querySelector("p")!;
    setDimensions(paragraph, 60, 60);

    let observedCallback: ResizeObserverCallback | undefined;
    const observe = jest.fn();
    class FakeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        observedCallback = callback;
      }
      observe = observe;
      unobserve = jest.fn();
      disconnect = jest.fn();
    }
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = FakeResizeObserver;

    loadScript();
    const toggle = document.querySelector(".kt-line-clamp-toggle") as HTMLButtonElement;

    expect(observe).toHaveBeenCalledWith(paragraph);

    setDimensions(paragraph, 120, 60);
    observedCallback?.([], {} as ResizeObserver);

    expect(toggle).not.toHaveClass("kt-line-clamp-toggle--hidden");

    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  });

  it("ignores a toggle whose previous sibling is not a line-clamped paragraph", () => {
    document.body.innerHTML =
      '<div>Other content</div><button type="button" class="kt-line-clamp-toggle" aria-expanded="false">Read more</button>';

    expect(() => loadScript()).not.toThrow();
  });
});
