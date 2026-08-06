jest.mock("@utils/scroll-lock", () => ({
  lockScroll: jest.fn(),
  unlockScroll: jest.fn(),
}));

import { lockScroll, unlockScroll } from "@utils/scroll-lock";
import "./mega-menu";

function buildMegaNav({ linkNavigates = false }: { linkNavigates?: boolean } = {}) {
  document.body.innerHTML = `
    <header></header>
    <nav class="kt-mega-nav">
      <div class="kt-mega-nav__backdrop"></div>
      <div class="kt-mega-nav__item" data-panel="products">
        <a class="kt-mega-nav__link" href="#">Products</a>
      </div>
      <div class="kt-mega-nav__item" data-panel="solutions">
        <a class="kt-mega-nav__link" href="/solutions">Solutions</a>
      </div>
      <div class="kt-mega-nav__item"></div>
      <div class="kt-mega-nav__panel" data-panel="products">
        <a href="#a">First</a>
        <a href="#b">Last</a>
      </div>
      <div class="kt-mega-nav__panel" data-panel="solutions"></div>
    </nav>
  `;
  if (linkNavigates) {
    document.querySelector(".kt-mega-nav")?.setAttribute("data-link-navigates", "true");
  }
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

function getItem(panelId: string) {
  return document.querySelector(`.kt-mega-nav__item[data-panel="${panelId}"]`) as HTMLElement;
}

function getPanel(panelId: string) {
  return document.querySelector(`.kt-mega-nav__panel[data-panel="${panelId}"]`) as HTMLElement;
}

describe("mega-menu.ts", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("does nothing when there is no .kt-mega-nav", () => {
    document.body.innerHTML = "";

    expect(() => document.dispatchEvent(new Event("DOMContentLoaded"))).not.toThrow();
  });

  it("opens the panel after the open delay on mouseenter", () => {
    buildMegaNav();
    const item = getItem("products");

    item.dispatchEvent(new MouseEvent("mouseenter"));
    jest.advanceTimersByTime(500);

    expect(item.classList.contains("is-active")).toBe(true);
    expect(getPanel("products").classList.contains("is-open")).toBe(true);
    expect(lockScroll).toHaveBeenCalledWith("mega-menu");
  });

  it("does not open the panel before the open delay elapses", () => {
    buildMegaNav();
    const item = getItem("products");

    item.dispatchEvent(new MouseEvent("mouseenter"));
    jest.advanceTimersByTime(499);

    expect(item.classList.contains("is-active")).toBe(false);
  });

  it("cancels the pending open when the mouse leaves before the delay elapses", () => {
    buildMegaNav();
    const item = getItem("products");

    item.dispatchEvent(new MouseEvent("mouseenter"));
    item.dispatchEvent(new MouseEvent("mouseleave"));
    jest.advanceTimersByTime(500);

    expect(item.classList.contains("is-active")).toBe(false);
  });

  it("switches directly to another panel when one is already open", () => {
    buildMegaNav();
    getItem("products").dispatchEvent(new MouseEvent("mouseenter"));
    jest.advanceTimersByTime(500);

    getItem("solutions").dispatchEvent(new MouseEvent("mouseenter"));
    jest.advanceTimersByTime(500);

    expect(getItem("products").classList.contains("is-active")).toBe(false);
    expect(getItem("solutions").classList.contains("is-active")).toBe(true);
  });

  it("toggles the panel open immediately on trigger click", () => {
    buildMegaNav();
    const item = getItem("products");
    const trigger = item.querySelector(".kt-mega-nav__link") as HTMLAnchorElement;

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    trigger.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(item.classList.contains("is-active")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes the panel on a second trigger click", () => {
    buildMegaNav();
    const item = getItem("products");
    const trigger = item.querySelector(".kt-mega-nav__link") as HTMLAnchorElement;

    trigger.click();
    trigger.click();

    expect(item.classList.contains("is-active")).toBe(false);
    expect(unlockScroll).toHaveBeenCalledWith("mega-menu");
  });

  it("toggles the panel on a Space keydown", () => {
    buildMegaNav();
    const item = getItem("products");
    const trigger = item.querySelector(".kt-mega-nav__link") as HTMLAnchorElement;

    const event = new KeyboardEvent("keydown", { key: " ", cancelable: true });
    trigger.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(item.classList.contains("is-active")).toBe(true);
  });

  it("does not intercept a real navigating link when data-link-navigates is set", () => {
    buildMegaNav({ linkNavigates: true });
    const item = getItem("solutions");
    const trigger = item.querySelector(".kt-mega-nav__link") as HTMLAnchorElement;

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    trigger.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(false);
    expect(item.classList.contains("is-active")).toBe(false);
  });

  it("moves focus into the panel on Tab from an active trigger", () => {
    buildMegaNav();
    const item = getItem("products");
    const trigger = item.querySelector(".kt-mega-nav__link") as HTMLAnchorElement;
    trigger.click();

    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trigger.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("closes the menu when the backdrop is clicked", () => {
    buildMegaNav();
    getItem("products")
      .querySelector("a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const backdrop = document.querySelector(".kt-mega-nav__backdrop") as HTMLElement;

    backdrop.dispatchEvent(new MouseEvent("click"));

    expect(getItem("products").classList.contains("is-active")).toBe(false);
    expect(unlockScroll).toHaveBeenCalledWith("mega-menu");
  });

  it("closes the menu on Escape", () => {
    buildMegaNav();
    getItem("products")
      .querySelector("a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(getItem("products").classList.contains("is-active")).toBe(false);
  });

  it("schedules a close on nav mouseleave and closes after the delay when focus is elsewhere", () => {
    buildMegaNav();
    const nav = document.querySelector(".kt-mega-nav") as HTMLElement;
    getItem("products")
      .querySelector("a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    nav.dispatchEvent(new MouseEvent("mouseleave"));
    jest.advanceTimersByTime(500);

    expect(getItem("products").classList.contains("is-active")).toBe(false);
  });

  it("does not close on scheduled close if focus is still within the nav", () => {
    buildMegaNav();
    const nav = document.querySelector(".kt-mega-nav") as HTMLElement;
    const trigger = getItem("products").querySelector("a") as HTMLAnchorElement;
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    trigger.focus();

    nav.dispatchEvent(new MouseEvent("mouseleave"));
    jest.advanceTimersByTime(500);

    expect(getItem("products").classList.contains("is-active")).toBe(true);
  });

  it("cancels a scheduled close when the mouse re-enters the nav", () => {
    buildMegaNav();
    const nav = document.querySelector(".kt-mega-nav") as HTMLElement;
    getItem("products")
      .querySelector("a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    nav.dispatchEvent(new MouseEvent("mouseleave"));
    nav.dispatchEvent(new MouseEvent("mouseenter"));
    jest.advanceTimersByTime(500);

    expect(getItem("products").classList.contains("is-active")).toBe(true);
  });

  it("closes the panel when focus moves entirely outside the open item and panel", () => {
    buildMegaNav();
    getItem("products")
      .querySelector("a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const outside = document.createElement("button");
    document.body.append(outside);

    const nav = document.querySelector(".kt-mega-nav") as HTMLElement;
    nav.dispatchEvent(new FocusEvent("focusout", { relatedTarget: outside }));

    expect(getItem("products").classList.contains("is-active")).toBe(false);
  });

  it("keeps the panel open when focus moves within the open panel", () => {
    buildMegaNav();
    getItem("products")
      .querySelector("a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const panelLink = getPanel("products").querySelector("a") as HTMLElement;

    const nav = document.querySelector(".kt-mega-nav") as HTMLElement;
    nav.dispatchEvent(new FocusEvent("focusout", { relatedTarget: panelLink }));

    expect(getItem("products").classList.contains("is-active")).toBe(true);
  });
});
