const BODY_ENABLED_CLASS = "accessibility-js-enabled";
const MENU_ITEM_SELECTOR = ".menu-item-has-children";
const SUBMENU_SELECTOR = ".sub-menu";
const SUBMENU_TOGGLE_CLASS = "submenu-toggle";
const SUBMENU_TOGGLE_SELECTOR = ".submenu-toggle";
const SUBMENU_ACTIVE_CLASS = "submenu-active";
const SUBMENU_TOGGLE_LABEL = "Toggle submenu";

function createToggleButton(): HTMLButtonElement {
  const toggleButton = document.createElement("button");
  toggleButton.setAttribute("type", "button");
  toggleButton.setAttribute("aria-haspopup", "true");
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("tabindex", "0");
  toggleButton.className = SUBMENU_TOGGLE_CLASS;
  toggleButton.setAttribute("aria-label", SUBMENU_TOGGLE_LABEL);
  toggleButton.innerHTML = "&#x25be;";
  return toggleButton;
}

function setSubmenuTabbables(submenu: Element, isActive: boolean): void {
  const tabindex = isActive ? "0" : "-1";
  submenu.querySelectorAll("a").forEach((subLink) => {
    subLink.setAttribute("tabindex", tabindex);
  });
  submenu.querySelectorAll(SUBMENU_TOGGLE_SELECTOR).forEach((innerToggle) => {
    innerToggle.setAttribute("tabindex", tabindex);
  });
}

function collapseSubmenu(item: Element, submenu: Element, toggleButton: HTMLButtonElement): void {
  toggleButton.setAttribute("aria-expanded", "false");
  item.classList.remove(SUBMENU_ACTIVE_CLASS);
  setSubmenuTabbables(submenu, false);
}

function createSubmenuToggler(
  item: Element,
  submenu: Element,
  toggleButton: HTMLButtonElement
): () => void {
  return () => {
    const wasExpanded = toggleButton.getAttribute("aria-expanded") === "true";
    toggleButton.setAttribute("aria-expanded", String(!wasExpanded));
    item.classList.toggle(SUBMENU_ACTIVE_CLASS, !wasExpanded);
    setSubmenuTabbables(submenu, !wasExpanded);
    if (!wasExpanded) {
      submenu.querySelector("a")?.focus();
    }
  };
}

function bindSubmenuToggle(item: Element): void {
  const link = item.querySelector("a");
  const submenu = item.querySelector(SUBMENU_SELECTOR);
  if (!link || !submenu) {
    return;
  }

  const toggleButton = createToggleButton();
  link.insertAdjacentElement("afterend", toggleButton);

  const toggleSubmenu = createSubmenuToggler(item, submenu, toggleButton);

  submenu.addEventListener("keydown", (event) => {
    if ((event as KeyboardEvent).key === "Escape") {
      collapseSubmenu(item, submenu, toggleButton);
      toggleButton.focus();
    }
  });

  setSubmenuTabbables(submenu, false);

  toggleButton.addEventListener("click", toggleSubmenu);
  toggleButton.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggleSubmenu();
    }
  });

  submenu.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!submenu.contains(document.activeElement)) {
        collapseSubmenu(item, submenu, toggleButton);
      }
    }, 0);
  });
}

export function initSubmenuToggles(): void {
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add(BODY_ENABLED_CLASS);
    document.querySelectorAll(MENU_ITEM_SELECTOR).forEach(bindSubmenuToggle);
  });
}
