jest.mock("./critical.scss", () => ({}), { virtual: true });
jest.mock("./scripts/theme-switcher", () => ({}));
jest.mock("./scripts/restoration", () => ({}));
jest.mock("./scripts/utils", () => ({}));
jest.mock("./scripts/sticky-header", () => ({}));

describe("critical loaded marker", () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.className = "";
  });

  it("marks body loaded immediately when the document is already parsed", () => {
    require("./critical");
    expect(document.body.classList.contains("loaded")).toBe(true);
  });

  it("marks body loaded on readystatechange while still loading", () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "loading",
    });
    require("./critical");
    expect(document.body.classList.contains("loaded")).toBe(false);
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "interactive",
    });
    document.dispatchEvent(new Event("readystatechange"));
    expect(document.body.classList.contains("loaded")).toBe(true);
    delete (document as unknown as Record<string, unknown>).readyState;
  });
});
