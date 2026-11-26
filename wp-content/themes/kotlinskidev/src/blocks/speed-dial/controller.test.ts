import { activeElement, setBody } from "./dom-fixture";
import { createController } from "./controller";

const setReducedMotion = (reduced: boolean) => {
  window.matchMedia = jest
    .fn()
    .mockReturnValue({ matches: reduced }) as unknown as typeof window.matchMedia;
};

const build = (closeOnAction = "true") => {
  setBody(`
    <div class="kt-speed-dial" data-kt-speed-dial data-close-on-action="${closeOnAction}">
      <button class="kt-speed-dial__toggle" aria-expanded="false"></button>
      <ul class="kt-speed-dial__list" hidden>
        <li class="kt-speed-dial__item"><a href="#x" class="kt-speed-dial__action">A</a></li>
      </ul>
    </div>
    <button id="outside"></button>`);
  const root = document.querySelector<HTMLElement>("[data-kt-speed-dial]") as HTMLElement;
  const toggle = root.querySelector<HTMLButtonElement>("button") as HTMLButtonElement;
  const list = root.querySelector<HTMLElement>("ul") as HTMLElement;
  return { root, toggle, list, controller: createController(root, toggle, list) };
};

describe("speed dial controller", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setReducedMotion(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    setBody("");
  });

  it("opens and sets state, then is-visible on the next frame", () => {
    const { root, toggle, list, controller } = build();
    controller.open();
    expect(list.hidden).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(root.classList.contains("is-open")).toBe(true);
    jest.advanceTimersByTime(20);
    expect(root.classList.contains("is-visible")).toBe(true);
    controller.destroy();
  });

  it("closes after the fallback timeout when motion is enabled", () => {
    const { root, toggle, list, controller } = build();
    controller.open();
    jest.advanceTimersByTime(20);
    controller.close();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(root.classList.contains("is-visible")).toBe(false);
    expect(list.hidden).toBe(false);
    jest.advanceTimersByTime(300);
    expect(list.hidden).toBe(true);
    expect(root.classList.contains("is-open")).toBe(false);
    controller.destroy();
  });

  it("closes on transitionend of the list", () => {
    const { list, controller } = build();
    controller.open();
    controller.close();
    list.dispatchEvent(new Event("transitionend"));
    expect(list.hidden).toBe(true);
    controller.destroy();
  });

  it("closes synchronously under reduced motion", () => {
    setReducedMotion(true);
    const { list, controller } = build();
    controller.open();
    controller.close();
    expect(list.hidden).toBe(true);
    controller.destroy();
  });

  it("closes synchronously with motion none", () => {
    const { root, list, controller } = build();
    root.classList.add("kt-speed-dial--motion-none");
    controller.open();
    controller.close();
    expect(list.hidden).toBe(true);
    controller.destroy();
  });

  it("toggles on toggle click", () => {
    const { toggle, controller } = build();
    toggle.click();
    expect(controller.isOpen()).toBe(true);
    toggle.click();
    expect(controller.isOpen()).toBe(false);
    controller.destroy();
  });

  it("closes on outside pointerdown only", () => {
    const { toggle, controller } = build();
    controller.open();
    toggle.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(controller.isOpen()).toBe(true);
    document.getElementById("outside")?.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(controller.isOpen()).toBe(false);
    controller.destroy();
  });

  it("closes when focus moves outside the root", () => {
    const { root, controller } = build();
    controller.open();
    const outside = document.getElementById("outside") as HTMLElement;
    root.dispatchEvent(new FocusEvent("focusout", { relatedTarget: outside }));
    expect(controller.isOpen()).toBe(false);
    controller.destroy();
  });

  it("stays open when focus leaves to nowhere", () => {
    const { root, controller } = build();
    controller.open();
    root.dispatchEvent(new FocusEvent("focusout", { relatedTarget: null }));
    expect(controller.isOpen()).toBe(true);
    controller.destroy();
  });

  it("closes on item click without preventing default", () => {
    const { list, controller } = build();
    controller.open();
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    list.querySelector("a")?.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(controller.isOpen()).toBe(false);
    controller.destroy();
  });

  it("keeps open on item click when close-on-action is false", () => {
    const { list, controller } = build("false");
    controller.open();
    list.querySelector("a")?.addEventListener("click", (e) => e.preventDefault());
    list.querySelector("a")?.click();
    expect(controller.isOpen()).toBe(true);
    controller.destroy();
  });

  it("closes on persisted pageshow", () => {
    const { controller } = build();
    controller.open();
    const event = new Event("pageshow") as PageTransitionEvent;
    Object.defineProperty(event, "persisted", { value: true });
    window.dispatchEvent(event);
    expect(controller.isOpen()).toBe(false);
    controller.destroy();
  });

  it("returns focus to the toggle when asked", () => {
    const { toggle, controller } = build();
    controller.open();
    controller.close({ returnFocus: true });
    expect(activeElement()).toBe(toggle);
    controller.destroy();
  });

  it("removes listeners on destroy", () => {
    const { toggle, controller } = build();
    controller.destroy();
    toggle.click();
    expect(controller.isOpen()).toBe(false);
  });
  it("returns focus to the toggle after an action is clicked", () => {
    const { toggle, list, controller } = build();
    controller.open();
    const action = list.querySelector("a") as HTMLAnchorElement;
    action.focus();
    action.click();
    expect(document.activeElement).toBe(toggle);
    controller.destroy();
  });

  it("leaves focus alone after an accessibility bridge action is clicked", () => {
    const { toggle, list, controller } = build();
    const bridge = document.createElement("button");
    bridge.setAttribute("data-kt-speed-dial-a11y", "open");
    list.append(bridge);
    controller.open();
    bridge.focus();
    bridge.click();
    expect(document.activeElement).not.toBe(toggle);
    controller.destroy();
  });
});
