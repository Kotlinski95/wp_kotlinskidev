import { initDropdownPanels } from "./dropdown-panel";
import { registerPanel, closeAllExcept } from "./panel-coordinator";
import { lockScroll, unlockScroll } from "./scroll-lock";

jest.mock("./panel-coordinator", () => ({
  registerPanel: jest.fn(),
  closeAllExcept: jest.fn(),
}));

jest.mock("./scroll-lock", () => ({
  lockScroll: jest.fn(),
  unlockScroll: jest.fn(),
}));

function buildPanel() {
  document.body.innerHTML = `
    <div class="panel" data-testid="panel">
      <button class="trigger" aria-expanded="false">Open</button>
      <div class="modal" aria-hidden="true">Modal content</div>
    </div>
  `;
  return {
    panel: document.querySelector<HTMLElement>(".panel")!,
    trigger: document.querySelector<HTMLButtonElement>(".trigger")!,
    modal: document.querySelector<HTMLElement>(".modal")!,
  };
}

const config = {
  rootSelector: ".panel",
  triggerSelector: ".trigger",
  modalSelector: ".modal",
};

describe("initDropdownPanels", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("does nothing when no panels match the root selector", () => {
    document.body.innerHTML = "";

    initDropdownPanels(config);

    expect(registerPanel).not.toHaveBeenCalled();
  });

  it("registers a close-all handler for the panel group", () => {
    buildPanel();

    initDropdownPanels(config);

    expect(registerPanel).toHaveBeenCalledTimes(1);
  });

  it("opens the panel on trigger click and locks scroll", () => {
    const { trigger, panel, modal } = buildPanel();
    initDropdownPanels(config);

    trigger.click();

    expect(panel.classList.contains("is-open")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(modal.getAttribute("aria-hidden")).toBe("false");
    expect(lockScroll).toHaveBeenCalledWith(config.rootSelector);
    expect(closeAllExcept).toHaveBeenCalledTimes(1);
  });

  it("closes the panel on a second trigger click and unlocks scroll", () => {
    const { trigger, panel, modal } = buildPanel();
    initDropdownPanels(config);

    trigger.click();
    trigger.click();

    expect(panel.classList.contains("is-open")).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(modal.getAttribute("aria-hidden")).toBe("true");
    expect(unlockScroll).toHaveBeenCalledWith(config.rootSelector);
  });

  it("calls onOpen with the modal element when opened", () => {
    const { trigger, modal } = buildPanel();
    const onOpen = jest.fn();
    initDropdownPanels({ ...config, onOpen });

    trigger.click();

    expect(onOpen).toHaveBeenCalledWith(modal);
  });

  it("closes the panel when Escape is pressed", () => {
    const { trigger, panel } = buildPanel();
    initDropdownPanels(config);
    trigger.click();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(panel.classList.contains("is-open")).toBe(false);
  });

  it("closes the panel on an outside click", () => {
    const { trigger, panel } = buildPanel();
    initDropdownPanels(config);
    trigger.click();

    document.body.click();

    expect(panel.classList.contains("is-open")).toBe(false);
  });

  it("does not close the panel on a click inside it while focus stays within it", () => {
    const { trigger, panel, modal } = buildPanel();
    modal.tabIndex = -1;
    initDropdownPanels(config);
    trigger.click();
    modal.focus();

    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(panel.classList.contains("is-open")).toBe(true);
  });

  it("stops propagation on modal clicks so the document handler does not fire", () => {
    const { trigger, modal } = buildPanel();
    initDropdownPanels(config);
    trigger.click();

    const documentClickHandler = jest.fn();
    document.addEventListener("click", documentClickHandler);
    modal.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(documentClickHandler).not.toHaveBeenCalled();
  });
});
