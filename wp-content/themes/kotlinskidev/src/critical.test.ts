jest.mock("./critical.scss", () => ({}), { virtual: true });
jest.mock("./scripts/theme-switcher", () => ({}));
jest.mock("./scripts/restoration", () => ({}));
jest.mock("./scripts/utils", () => ({}));
jest.mock("./scripts/app-shell", () => ({}));
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

describe("critical view transition marker", () => {
  beforeEach(() => {
    jest.resetModules();
    document.documentElement.className = "";
  });

  const reveal = (viewTransition: unknown): void => {
    const event = new Event("pagereveal");
    Object.defineProperty(event, "viewTransition", { value: viewTransition });
    window.dispatchEvent(event);
  };

  it("adds kt-vt when the reveal carries a view transition", () => {
    require("./critical");
    reveal({});
    expect(document.documentElement.classList.contains("kt-vt")).toBe(true);
  });

  it("leaves html unchanged when there is no view transition", () => {
    require("./critical");
    reveal(null);
    window.dispatchEvent(new Event("pagereveal"));
    expect(document.documentElement.classList.contains("kt-vt")).toBe(false);
  });

  it("does not throw when listener registration fails", () => {
    const spy = jest.spyOn(window, "addEventListener").mockImplementation(() => {
      throw new Error("unsupported");
    });
    expect(() => require("./critical")).not.toThrow();
    spy.mockRestore();
  });
});
