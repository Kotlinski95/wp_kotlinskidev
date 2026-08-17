import { registerPanel, closeAllExcept } from "@utils/panel-coordinator";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";

jest.mock("@utils/panel-coordinator", () => ({
  registerPanel: jest.fn(),
  closeAllExcept: jest.fn(),
}));
jest.mock("@utils/scroll-lock", () => ({
  lockScroll: jest.fn(),
  unlockScroll: jest.fn(),
}));

import "./modal-manager";

function buildModal(id: string): HTMLElement {
  const modal = document.createElement("div");
  modal.id = id;
  modal.className = "kt-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML =
    '<button type="button" class="kt-modal__close" data-kt-modal-close>Close</button>' +
    '<a href="https://example.test">Inside link</a>' +
    '<div class="kt-modal__backdrop" data-kt-modal-close></div>';
  return modal;
}

function ready(): void {
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

beforeEach(() => {
  document.body.innerHTML = "";
  jest.clearAllMocks();
});

describe("modal-manager", () => {
  it("registers itself with the panel coordinator on DOMContentLoaded", () => {
    ready();

    expect(registerPanel).toHaveBeenCalledWith(expect.any(Function));
  });

  it("opens the modal referenced by a data-kt-modal-target trigger", () => {
    ready();
    const modal = buildModal("kt-modal-1");
    const trigger = document.createElement("a");
    trigger.href = "https://example.test";
    trigger.setAttribute("data-kt-modal-target", "kt-modal-1");
    document.body.append(modal, trigger);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    trigger.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(modal.classList.contains("is-open")).toBe(true);
    expect(modal.getAttribute("aria-hidden")).toBe("false");
    expect(lockScroll).toHaveBeenCalledWith("kt-modal");
    expect(closeAllExcept).toHaveBeenCalled();
  });

  it("opens the modal referenced by a plain #kt-modal-{id} href when no data attribute is present", () => {
    ready();
    const modal = buildModal("kt-modal-2");
    const trigger = document.createElement("a");
    trigger.href = "#kt-modal-2";
    document.body.append(modal, trigger);

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(modal.classList.contains("is-open")).toBe(true);
  });

  it("leaves navigation untouched when a data-kt-modal-target trigger points at a missing modal", () => {
    ready();
    const trigger = document.createElement("a");
    trigger.href = "https://example.test";
    trigger.setAttribute("data-kt-modal-target", "kt-modal-missing");
    document.body.append(trigger);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    trigger.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("applies inert to background siblings while open and removes it on close", () => {
    ready();
    const modal = buildModal("kt-modal-3");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-3");
    const sibling = document.createElement("div");
    document.body.append(sibling, modal, trigger);

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(sibling.hasAttribute("inert")).toBe(true);
    expect(modal.hasAttribute("inert")).toBe(false);

    modal.querySelector<HTMLElement>("[data-kt-modal-close]")!.click();
    expect(sibling.hasAttribute("inert")).toBe(false);
  });

  it("focuses the close button on open", () => {
    ready();
    const modal = buildModal("kt-modal-4");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-4");
    document.body.append(modal, trigger);
    const closeButton = modal.querySelector<HTMLElement>(".kt-modal__close")!;
    jest.spyOn(closeButton, "focus");

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(closeButton.focus).toHaveBeenCalled();
  });

  it("closes on backdrop click and returns focus to the trigger", () => {
    ready();
    const modal = buildModal("kt-modal-5");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-5");
    document.body.append(modal, trigger);
    jest.spyOn(trigger, "focus");

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    modal.querySelector<HTMLElement>(".kt-modal__backdrop")!.click();

    expect(modal.classList.contains("is-open")).toBe(false);
    expect(modal.getAttribute("aria-hidden")).toBe("true");
    expect(unlockScroll).toHaveBeenCalledWith("kt-modal");
    expect(trigger.focus).toHaveBeenCalled();
  });

  it("does not throw and skips focus when the trigger was removed from the DOM before close", () => {
    ready();
    const modal = buildModal("kt-modal-6");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-6");
    document.body.append(modal, trigger);

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    trigger.remove();

    expect(() => modal.querySelector<HTMLElement>("[data-kt-modal-close]")!.click()).not.toThrow();
  });

  it("closes the open modal on Escape", () => {
    ready();
    const modal = buildModal("kt-modal-7");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-7");
    document.body.append(modal, trigger);

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(modal.classList.contains("is-open")).toBe(false);
  });

  it("does nothing on Escape when no modal is open", () => {
    ready();

    expect(() =>
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    ).not.toThrow();
  });

  it("wraps focus from the last focusable element back to the first on Tab", () => {
    ready();
    const modal = buildModal("kt-modal-8");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-8");
    document.body.append(modal, trigger);
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    const closeButton = modal.querySelector<HTMLElement>(".kt-modal__close")!;
    const insideLink = modal.querySelector<HTMLElement>("a")!;
    insideLink.focus();
    expect(document.activeElement).toBe(insideLink);

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(closeButton);
  });

  it("wraps focus from the first focusable element back to the last on Shift+Tab", () => {
    ready();
    const modal = buildModal("kt-modal-9");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-9");
    document.body.append(modal, trigger);
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    const closeButton = modal.querySelector<HTMLElement>(".kt-modal__close")!;
    const insideLink = modal.querySelector<HTMLElement>("a")!;
    closeButton.focus();

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(insideLink);
  });

  it("opens the modal when Enter is pressed on a non-native (role=button) trigger", () => {
    ready();
    const modal = buildModal("kt-modal-10");
    const trigger = document.createElement("div");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-10");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    document.body.append(modal, trigger);

    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(modal.classList.contains("is-open")).toBe(true);
  });

  it("opens the modal when Space is pressed on a non-native (role=button) trigger", () => {
    ready();
    const modal = buildModal("kt-modal-11");
    const trigger = document.createElement("div");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-11");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    document.body.append(modal, trigger);

    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    trigger.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(modal.classList.contains("is-open")).toBe(true);
  });

  it("does not synthesize a click for a native anchor trigger on Enter (browser handles it natively)", () => {
    ready();
    const modal = buildModal("kt-modal-12");
    const trigger = document.createElement("a");
    trigger.setAttribute("data-kt-modal-target", "kt-modal-12");
    document.body.append(modal, trigger);
    const clickSpy = jest.spyOn(trigger, "click");

    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("ignores Enter/Space presses on unrelated elements", () => {
    ready();
    const other = document.createElement("div");
    document.body.append(other);

    expect(() =>
      other.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    ).not.toThrow();
  });

  it("closes the modal when clicking data-kt-modal-close outside a modal-open state without throwing", () => {
    ready();
    const standaloneClose = document.createElement("button");
    standaloneClose.setAttribute("data-kt-modal-close", "");
    document.body.append(standaloneClose);

    expect(() =>
      standaloneClose.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    ).not.toThrow();
  });
});
