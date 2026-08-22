function loadScript() {
  jest.resetModules();
  require("./group-link");
}

describe("group-link.ts", () => {
  let hrefSetter: jest.Mock;

  beforeEach(() => {
    hrefSetter = jest.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return "";
        },
        set href(value: string) {
          hrefSetter(value);
        },
      },
    });
    jest.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does nothing when there is no group-link element on the page", () => {
    document.body.innerHTML = "<div>no links here</div>";

    expect(() => loadScript()).not.toThrow();
  });

  it("navigates to the url when clicking anywhere inside the group", () => {
    document.body.innerHTML =
      '<div class="kt-group-link" data-kt-group-link-url="/contact/"><p>Text</p></div>';
    loadScript();

    document.querySelector("p")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(hrefSetter).toHaveBeenCalledWith("/contact/");
  });

  it("opens in a new tab when the target attribute is set", () => {
    document.body.innerHTML =
      '<div class="kt-group-link" data-kt-group-link-url="/contact/" data-kt-group-link-target="_blank"><p>Text</p></div>';
    loadScript();

    document.querySelector("p")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(window.open).toHaveBeenCalledWith("/contact/", "_blank", "noopener");
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("does not navigate when clicking a nested link", () => {
    document.body.innerHTML =
      '<div class="kt-group-link" data-kt-group-link-url="/contact/"><a href="/other/">Other</a></div>';
    loadScript();

    document.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("does not navigate when clicking a nested button", () => {
    document.body.innerHTML =
      '<div class="kt-group-link" data-kt-group-link-url="/contact/"><button>Click</button></div>';
    loadScript();

    document.querySelector("button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("navigates on Enter when the group itself is focused", () => {
    document.body.innerHTML =
      '<div class="kt-group-link" data-kt-group-link-url="/contact/" tabindex="0"><p>Text</p></div>';
    loadScript();

    const group = document.querySelector(".kt-group-link") as HTMLElement;
    group.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(hrefSetter).toHaveBeenCalledWith("/contact/");
  });

  it("does not navigate on Enter bubbling up from a nested element", () => {
    document.body.innerHTML =
      '<div class="kt-group-link" data-kt-group-link-url="/contact/" tabindex="0"><p>Text</p></div>';
    loadScript();

    document
      .querySelector("p")
      ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("lets a real anchor's own default click behavior handle navigation, no preventDefault", () => {
    document.body.innerHTML = '<a class="kt-group-link" href="/contact/"><p>Text</p></a>';
    loadScript();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.querySelector("p")?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("prevents the real anchor's default navigation when clicking a nested interactive element", () => {
    document.body.innerHTML =
      '<a class="kt-group-link" href="/contact/"><button>Click</button></a>';
    loadScript();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.querySelector("button")?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prevent default when clicking the anchor itself, only nested interactive descendants", () => {
    document.body.innerHTML = '<a class="kt-group-link" href="/contact/"><p>Text</p></a>';
    loadScript();

    const anchor = document.querySelector(".kt-group-link") as HTMLElement;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
