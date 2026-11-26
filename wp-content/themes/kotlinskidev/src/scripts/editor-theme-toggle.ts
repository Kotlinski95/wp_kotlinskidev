import { __ } from "@wordpress/i18n";

type EditorThemeMode = "light" | "dark";

const STORAGE_KEY = "kotlinskidev-editor-theme";
const SYNC_INTERVAL_MS = 1000;
const EDITOR_CANVAS_FRAME_SELECTOR = 'iframe[name="editor-canvas"]';
const EDITOR_STYLES_WRAPPER_SELECTOR = ".editor-styles-wrapper";
const EDITOR_HEADER_SELECTOR =
  ".editor-header__settings, .edit-post-header__settings, .edit-site-header-edit-mode__actions";
const TOGGLE_BUTTON_CLASS = "kt-editor-theme-toggle";

const getInitialMode = (): EditorThemeMode => {
  return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
};

let currentMode: EditorThemeMode = getInitialMode();

const applyModeToElement = (element: Element | null, mode: EditorThemeMode): void => {
  if (!element) {
    return;
  }
  element.classList.toggle("light-mode", mode === "light");
  element.classList.toggle("dark-mode", mode === "dark");
};

const applyMode = (mode: EditorThemeMode): void => {
  document.querySelectorAll<HTMLIFrameElement>(EDITOR_CANVAS_FRAME_SELECTOR).forEach((frame) => {
    const canvasDocument = frame.contentDocument;
    if (!canvasDocument) {
      return;
    }
    applyModeToElement(canvasDocument.documentElement, mode);
    applyModeToElement(canvasDocument.body, mode);
  });
  document.querySelectorAll(EDITOR_STYLES_WRAPPER_SELECTOR).forEach((wrapper) => {
    applyModeToElement(wrapper, mode);
  });
};

const buttonLabel = (mode: EditorThemeMode): string =>
  mode === "dark"
    ? __("Canvas theme: dark — switch to light", "kotlinskidev")
    : __("Canvas theme: light — switch to dark", "kotlinskidev");

const updateButton = (button: HTMLButtonElement, mode: EditorThemeMode): void => {
  button.textContent = mode === "dark" ? "🌙" : "☀️";
  button.setAttribute("aria-label", buttonLabel(mode));
  button.title = buttonLabel(mode);
};

const ensureToggleButton = (): void => {
  const header = document.querySelector(EDITOR_HEADER_SELECTOR);
  if (!header || header.querySelector(`.${TOGGLE_BUTTON_CLASS}`)) {
    return;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = `components-button ${TOGGLE_BUTTON_CLASS}`;
  button.style.fontSize = "1.125rem";
  updateButton(button, currentMode);
  button.addEventListener("click", () => {
    currentMode = currentMode === "dark" ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, currentMode);
    updateButton(button, currentMode);
    applyMode(currentMode);
  });
  header.prepend(button);
};

const syncEditorTheme = (): void => {
  ensureToggleButton();
  applyMode(currentMode);
};

syncEditorTheme();
window.setInterval(syncEditorTheme, SYNC_INTERVAL_MS);
