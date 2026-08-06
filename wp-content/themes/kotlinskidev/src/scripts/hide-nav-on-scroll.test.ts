function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

function setScrollTop(value: number) {
  Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value });
}

function buildMarkup() {
  document.body.innerHTML = `
    <header></header>
    <div class="mobile-footer-nav"></div>
    <div class="kotlinskidev-scrollto-top"></div>
  `;
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: 3000,
  });
  Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 800 });
}

function loadOnMobile() {
  setInnerWidth(500);
  jest.resetModules();
  require("./hide-nav-on-scroll");
}

function scrollAndFlush(top: number) {
  setScrollTop(top);
  window.dispatchEvent(new Event("scroll"));
  jest.advanceTimersByTime(10);
}

describe("hide-nav-on-scroll.ts", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setScrollTop(0);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    setInnerWidth(1024);
  });

  it("does nothing when neither header nor mobile footer nav is present", () => {
    document.body.innerHTML = "";

    expect(() => loadOnMobile()).not.toThrow();
  });

  it("does not react to scroll on a desktop viewport", () => {
    buildMarkup();
    setInnerWidth(1200);
    jest.resetModules();
    require("./hide-nav-on-scroll");
    const header = document.querySelector("header") as HTMLElement;

    scrollAndFlush(500);

    expect(header.classList.contains("nav-hidden")).toBe(false);
  });

  it("hides the nav when scrolling down past the top threshold", () => {
    buildMarkup();
    loadOnMobile();
    const header = document.querySelector("header") as HTMLElement;

    scrollAndFlush(200);

    expect(header.classList.contains("nav-hidden")).toBe(true);
  });

  it("shows the nav again when scrolling back up", () => {
    buildMarkup();
    loadOnMobile();
    const header = document.querySelector("header") as HTMLElement;

    scrollAndFlush(300);
    expect(header.classList.contains("nav-hidden")).toBe(true);

    scrollAndFlush(150);
    expect(header.classList.contains("nav-hidden")).toBe(false);
  });

  it("ignores scroll changes smaller than the threshold", () => {
    buildMarkup();
    loadOnMobile();
    const header = document.querySelector("header") as HTMLElement;

    scrollAndFlush(200);
    expect(header.classList.contains("nav-hidden")).toBe(true);

    scrollAndFlush(205);
    expect(header.classList.contains("nav-hidden")).toBe(true);
  });

  it("always shows the nav near the top of the page", () => {
    buildMarkup();
    loadOnMobile();
    const header = document.querySelector("header") as HTMLElement;

    scrollAndFlush(200);
    expect(header.classList.contains("nav-hidden")).toBe(true);

    scrollAndFlush(50);
    expect(header.classList.contains("nav-hidden")).toBe(false);
  });

  it("always shows the nav near the bottom of the page", () => {
    buildMarkup();
    loadOnMobile();
    const header = document.querySelector("header") as HTMLElement;

    scrollAndFlush(2250);

    expect(header.classList.contains("nav-hidden")).toBe(false);
  });

  it("hides the mobile footer nav, scroll-to-top button, and cookie button together", () => {
    buildMarkup();
    const cookieButton = document.createElement("button");
    cookieButton.className = "cmplz-btn cmplz-manage-consent";
    document.body.append(cookieButton);
    loadOnMobile();

    scrollAndFlush(300);

    expect(document.querySelector(".mobile-footer-nav")?.classList.contains("nav-hidden")).toBe(
      true
    );
    expect(
      document.querySelector(".kotlinskidev-scrollto-top")?.classList.contains("mobile-nav-hidden")
    ).toBe(true);
    expect(cookieButton.classList.contains("mobile-nav-hidden")).toBe(true);
  });

  it("re-shows the nav when switching from mobile to desktop", () => {
    buildMarkup();
    loadOnMobile();
    const header = document.querySelector("header") as HTMLElement;
    scrollAndFlush(300);
    expect(header.classList.contains("nav-hidden")).toBe(true);

    setInnerWidth(1200);
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(150);

    expect(header.classList.contains("nav-hidden")).toBe(false);
  });

  it("re-enables scroll hiding when switching back to mobile", () => {
    buildMarkup();
    setInnerWidth(1200);
    jest.resetModules();
    require("./hide-nav-on-scroll");
    const header = document.querySelector("header") as HTMLElement;

    setInnerWidth(500);
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(150);

    scrollAndFlush(300);
    expect(header.classList.contains("nav-hidden")).toBe(true);
  });
});
