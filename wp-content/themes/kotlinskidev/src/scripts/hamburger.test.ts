jest.mock("@utils/panel-coordinator", () => ({
  registerPanel: jest.fn(),
  closeAllExcept: jest.fn(),
}));

jest.mock("@utils/scroll-lock", () => ({
  lockScroll: jest.fn(),
  unlockScroll: jest.fn(),
}));

import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";
import "./hamburger";

function flushMicrotasks() {
  return new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
}

function buildNav({ open = false }: { open?: boolean } = {}) {
  document.body.innerHTML = `
    <nav class="wp-block-navigation">
      <button class="wp-block-navigation__responsive-container-open"></button>
      <div class="wp-block-navigation__responsive-container">
        <button class="wp-block-navigation__responsive-container-close"></button>
        <ul class="wp-block-navigation__container">
          <li class="wp-block-navigation-item">
            <button class="wp-block-navigation-submenu__toggle" aria-expanded="false"></button>
            <ul class="wp-block-navigation__submenu-container">
              <li class="wp-block-navigation-item">
                <a class="wp-block-navigation-item__content" href="#">Child</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  `;
  if (open) {
    document
      .querySelector(".wp-block-navigation__responsive-container")
      ?.classList.add("is-menu-open");
  }
}

function loadModule() {
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("hamburger.ts", () => {
  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("locks scroll on init when a container starts already open", () => {
    buildNav({ open: true });

    loadModule();

    expect(lockScroll).toHaveBeenCalledWith("hamburger");
  });

  it("does not lock scroll on init when no container starts open", () => {
    buildNav({ open: false });

    loadModule();

    expect(lockScroll).not.toHaveBeenCalled();
  });

  it("collapses submenu items to tabindex -1 when the toggle starts collapsed", () => {
    buildNav();

    loadModule();

    const link = document.querySelector(".wp-block-navigation-item__content") as HTMLElement;
    expect(link.getAttribute("tabindex")).toBe("-1");
  });

  it("makes submenu items tabbable when the toggle starts expanded", () => {
    document.body.innerHTML = `
      <li class="wp-block-navigation-item">
        <button class="wp-block-navigation-submenu__toggle" aria-expanded="true"></button>
        <ul class="wp-block-navigation__submenu-container">
          <li class="wp-block-navigation-item">
            <a class="wp-block-navigation-item__content" href="#">Child</a>
          </li>
        </ul>
      </li>
    `;

    loadModule();

    const link = document.querySelector(".wp-block-navigation-item__content") as HTMLElement;
    expect(link.getAttribute("tabindex")).toBe("0");
  });

  it("removes the animating class only on the container's own max-width transition", () => {
    buildNav();
    loadModule();
    const container = document.querySelector(
      ".wp-block-navigation__responsive-container"
    ) as HTMLElement;
    container.classList.add("kt-nav-panel-animating");

    const opacityEvent = new Event("transitionend");
    Object.defineProperty(opacityEvent, "propertyName", { value: "opacity" });
    container.dispatchEvent(opacityEvent);
    expect(container.classList.contains("kt-nav-panel-animating")).toBe(true);

    const event = new Event("transitionend");
    Object.defineProperty(event, "propertyName", { value: "max-width" });
    container.dispatchEvent(event);

    expect(container.classList.contains("kt-nav-panel-animating")).toBe(false);
  });

  it("locks scroll and focuses the close button when the menu opens via a class mutation", async () => {
    buildNav();
    loadModule();
    const container = document.querySelector(
      ".wp-block-navigation__responsive-container"
    ) as HTMLElement;
    const closeBtn = document.querySelector(
      ".wp-block-navigation__responsive-container-close"
    ) as HTMLButtonElement;
    jest.spyOn(closeBtn, "focus");

    container.classList.add("is-menu-open");
    await flushMicrotasks();

    expect(lockScroll).toHaveBeenCalledWith("hamburger");
    expect(container.classList.contains("kt-nav-panel-animating")).toBe(true);
    expect(closeBtn.focus).toHaveBeenCalled();
  });

  it("unlocks scroll when the menu closes via a class mutation", async () => {
    buildNav({ open: true });
    loadModule();
    const container = document.querySelector(
      ".wp-block-navigation__responsive-container"
    ) as HTMLElement;

    container.classList.remove("is-menu-open");
    await flushMicrotasks();

    expect(unlockScroll).toHaveBeenCalledWith("hamburger");
  });

  it("redirects the first focus-in after opening back to the close button", async () => {
    buildNav();
    loadModule();
    const container = document.querySelector(
      ".wp-block-navigation__responsive-container"
    ) as HTMLElement;
    const closeBtn = document.querySelector(
      ".wp-block-navigation__responsive-container-close"
    ) as HTMLButtonElement;
    const otherLink = document.querySelector(".wp-block-navigation-item__content") as HTMLElement;
    jest.spyOn(closeBtn, "focus");

    container.classList.add("is-menu-open");
    await flushMicrotasks();
    (closeBtn.focus as jest.Mock).mockClear();

    otherLink.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

    expect(closeBtn.focus).toHaveBeenCalled();
  });

  it("registers a closeHamburger callback with the panel coordinator", () => {
    buildNav({ open: true });

    loadModule();

    expect(registerPanel).toHaveBeenCalledWith(expect.any(Function));
  });

  it("closeHamburger clicks the close button of any currently open nav", () => {
    buildNav({ open: true });
    loadModule();
    const closeBtn = document.querySelector(
      ".wp-block-navigation__responsive-container-close"
    ) as HTMLButtonElement;
    const clickSpy = jest.spyOn(closeBtn, "click");

    const closeHamburger = (registerPanel as jest.Mock).mock.calls[0][0];
    closeHamburger();

    expect(clickSpy).toHaveBeenCalled();
  });

  it("relocates the close button right after the open button and prevents mousedown default", () => {
    buildNav();
    loadModule();

    const openBtn = document.querySelector(
      ".wp-block-navigation__responsive-container-open"
    ) as HTMLElement;
    const closeBtn = document.querySelector(
      ".wp-block-navigation__responsive-container-close"
    ) as HTMLButtonElement;
    expect(openBtn.nextElementSibling).toBe(closeBtn);

    const mousedownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    closeBtn.dispatchEvent(mousedownEvent);
    expect(mousedownEvent.defaultPrevented).toBe(true);
  });

  it("closes other open panels when the open button is clicked while closed", () => {
    buildNav({ open: false });
    loadModule();
    const openBtn = document.querySelector(
      ".wp-block-navigation__responsive-container-open"
    ) as HTMLElement;

    openBtn.click();

    expect(closeAllExcept).toHaveBeenCalledWith(expect.any(Function));
  });

  it("does not call closeAllExcept when clicking open while already open", () => {
    buildNav({ open: true });
    loadModule();
    const openBtn = document.querySelector(
      ".wp-block-navigation__responsive-container-open"
    ) as HTMLElement;

    openBtn.click();

    expect(closeAllExcept).not.toHaveBeenCalled();
  });

  it("expands a submenu toggle on click and marks its children tabbable", () => {
    buildNav();
    loadModule();
    const toggle = document.querySelector(".wp-block-navigation-submenu__toggle") as HTMLElement;

    toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const link = document.querySelector(".wp-block-navigation-item__content") as HTMLElement;
    expect(link.getAttribute("tabindex")).toBe("0");
  });

  it("collapses a submenu toggle back on a second click", () => {
    buildNav();
    loadModule();
    const toggle = document.querySelector(".wp-block-navigation-submenu__toggle") as HTMLElement;

    toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("collapses sibling submenu toggles when one is opened", () => {
    document.body.innerHTML = `
      <ul class="wp-block-navigation__container">
        <li class="wp-block-navigation-item">
          <button class="wp-block-navigation-submenu__toggle" id="a" aria-expanded="true"></button>
          <div class="wp-block-navigation__submenu-container"></div>
        </li>
        <li class="wp-block-navigation-item">
          <button class="wp-block-navigation-submenu__toggle" id="b" aria-expanded="false"></button>
          <div class="wp-block-navigation__submenu-container"></div>
        </li>
      </ul>
    `;
    loadModule();
    const toggleB = document.getElementById("b") as HTMLElement;

    toggleB.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const toggleA = document.getElementById("a") as HTMLElement;
    expect(toggleA.getAttribute("aria-expanded")).toBe("false");
    expect(toggleB.getAttribute("aria-expanded")).toBe("true");
  });

  it("ignores clicks that do not originate from a submenu toggle", () => {
    buildNav();
    loadModule();
    const toggle = document.querySelector(".wp-block-navigation-submenu__toggle") as HTMLElement;
    const outside = document.createElement("div");
    document.body.append(outside);

    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});
