jest.mock("../../scripts/track-event", () => ({
  trackEvent: jest.fn(),
}));

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const MEGABYTE = 1024 * 1024;

const messages = {
  count: "At most %s files.",
  total: "Over %s total.",
  file: "%s too big.",
  type: "%s not allowed.",
  remove: "Remove %s",
};

function makeFile(name: string, size: number): File {
  const file = new File(["x"], name, { type: "application/octet-stream", lastModified: 1 });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function selectFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { value: files, configurable: true, writable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

class FakeDataTransfer {
  private readonly stored: File[] = [];
  public items = { add: (file: File): number => this.stored.push(file) };
  public get files(): File[] {
    return this.stored;
  }
}

function loadModule(): void {
  jest.resetModules();
  require("./init");
}

describe("contact-form init.ts attachments", () => {
  beforeEach(() => {
    (global as unknown as { DataTransfer: unknown }).DataTransfer = FakeDataTransfer;
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { nonce: "fresh" } }),
    });
    const form = document.createElement("form");
    form.className = "contact-form-ts";
    form.dataset.nonceUrl = "/n";
    form.dataset.attachmentsMaxFiles = "3";
    form.dataset.attachmentsMaxTotal = String(10 * MEGABYTE);
    form.dataset.attachmentsMaxFile = String(8 * MEGABYTE);
    form.dataset.attachmentsExtensions = "pdf,png,txt";
    form.dataset.attachmentsMessages = JSON.stringify(messages);
    const nonce = document.createElement("input");
    nonce.type = "hidden";
    nonce.name = "kotlinskidev_contact_form_nonce";
    nonce.value = "stale";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.className = "kt-contact-attachments__input";
    fileInput.name = "attachments[]";
    fileInput.multiple = true;
    const list = document.createElement("ul");
    list.className = "kt-contact-attachments__list";
    const errorBox = document.createElement("div");
    errorBox.className = "kt-contact-attachments__error";
    errorBox.setAttribute("role", "alert");
    form.append(nonce, fileInput, list, errorBox);
    document.body.replaceChildren(form);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  const input = (): HTMLInputElement =>
    document.querySelector<HTMLInputElement>(".kt-contact-attachments__input")!;
  const errorText = (): string =>
    document.querySelector(".kt-contact-attachments__error")!.textContent ?? "";
  const items = (): NodeListOf<Element> =>
    document.querySelectorAll(".kt-contact-attachments__item");

  it("lists chosen files with their size and a remove button", async () => {
    loadModule();
    await flush();
    selectFiles(input(), [makeFile("cv.pdf", 2 * MEGABYTE)]);

    expect(items()).toHaveLength(1);
    expect(items()[0].textContent).toContain("cv.pdf (2.0 MB)");
    expect(items()[0].querySelector("button")!.getAttribute("aria-label")).toBe("Remove cv.pdf");
    expect(errorText()).toBe("");
  });

  it("flags more files than the limit", async () => {
    loadModule();
    await flush();
    selectFiles(
      input(),
      ["a", "b", "c", "d"].map((n) => makeFile(`${n}.pdf`, 10))
    );

    expect(errorText()).toBe("At most 3 files.");
  });

  it("flags a disallowed extension, including a double extension", async () => {
    loadModule();
    await flush();
    selectFiles(input(), [makeFile("invoice.pdf.exe", 10)]);

    expect(errorText()).toBe("invoice.pdf.exe not allowed.");
  });

  it("flags a file over the per-file limit and a total over the limit", async () => {
    loadModule();
    await flush();
    selectFiles(input(), [makeFile("big.pdf", 9 * MEGABYTE)]);
    expect(errorText()).toBe("big.pdf too big.");

    document.querySelector<HTMLButtonElement>(".kt-contact-attachments__remove")!.click();
    selectFiles(input(), [makeFile("a.pdf", 6 * MEGABYTE), makeFile("b.pdf", 6 * MEGABYTE)]);
    expect(errorText()).toBe("Over 10.0 MB total.");
  });

  it("removes a file and clears the error", async () => {
    loadModule();
    await flush();
    selectFiles(input(), [makeFile("a.pdf", 10), makeFile("b.exe", 10)]);
    expect(errorText()).not.toBe("");

    items()[1].querySelector("button")!.click();

    expect(items()).toHaveLength(1);
    expect(errorText()).toBe("");
  });

  it("blocks submit while invalid and lets it through when valid", async () => {
    loadModule();
    await flush();
    const form = document.querySelector<HTMLFormElement>(".contact-form-ts")!;
    form.submit = jest.fn();

    selectFiles(input(), [makeFile("x.exe", 10)]);
    const blocked = new Event("submit", { cancelable: true });
    form.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBe(true);
    expect(form.submit).not.toHaveBeenCalled();

    items()[0].querySelector("button")!.click();
    selectFiles(input(), [makeFile("ok.txt", 10)]);
    const allowed = new Event("submit", { cancelable: true });
    form.dispatchEvent(allowed);
    expect(allowed.defaultPrevented).toBe(false);
  });

  it("still re-submits through form.submit() with files after a stale nonce refresh", async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockRejectedValue(new Error("x"));
    loadModule();
    await flush();
    const form = document.querySelector<HTMLFormElement>(".contact-form-ts")!;
    form.submit = jest.fn();
    selectFiles(input(), [makeFile("ok.pdf", 10)]);
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { nonce: "latest" } }),
    });

    form.dispatchEvent(new Event("submit", { cancelable: true }));
    await flush();

    expect(form.submit).toHaveBeenCalledTimes(1);
    expect(input().files).toHaveLength(1);
  });
});
