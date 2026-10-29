function buildEditorHeader() {
  document.body.innerHTML = '<div class="editor-header__settings"></div>';
  return document.querySelector(".editor-header__settings") as HTMLElement;
}

function loadModule() {
  jest.resetModules();
  require("./editor-theme-toggle");
}

describe("editor-theme-toggle.ts", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

  it("does not add a toggle button when no editor header is present", () => {
    document.body.innerHTML = "";

    loadModule();

    expect(document.querySelector(".kt-editor-theme-toggle")).toBeNull();
  });

  it("adds a light-mode toggle button by default", () => {
    buildEditorHeader();

    loadModule();

    const button = document.querySelector(".kt-editor-theme-toggle") as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("☀️");
  });

  it("starts in dark mode when localStorage says dark", () => {
    localStorage.setItem("kotlinskidev-editor-theme", "dark");
    buildEditorHeader();

    loadModule();

    const button = document.querySelector(".kt-editor-theme-toggle") as HTMLButtonElement;
    expect(button.textContent).toBe("🌙");
  });

  it("does not insert a second button on repeated syncs", () => {
    buildEditorHeader();
    loadModule();

    jest.advanceTimersByTime(1000);

    expect(document.querySelectorAll(".kt-editor-theme-toggle")).toHaveLength(1);
  });

  it("toggles mode, persists it, and updates the button on click", () => {
    const header = buildEditorHeader();
    loadModule();
    const button = header.querySelector(".kt-editor-theme-toggle") as HTMLButtonElement;

    button.click();

    expect(button.textContent).toBe("🌙");
    expect(localStorage.getItem("kotlinskidev-editor-theme")).toBe("dark");
  });

  it("applies the mode to .editor-styles-wrapper elements", () => {
    const header = buildEditorHeader();
    const wrapper = document.createElement("div");
    wrapper.className = "editor-styles-wrapper";
    document.body.append(wrapper);
    loadModule();
    const button = header.querySelector(".kt-editor-theme-toggle") as HTMLButtonElement;

    button.click();

    expect(wrapper.classList.contains("dark-mode")).toBe(true);
    expect(wrapper.classList.contains("light-mode")).toBe(false);
  });

  it("applies the mode inside an accessible editor-canvas iframe", () => {
    const header = buildEditorHeader();
    const iframe = document.createElement("iframe");
    iframe.name = "editor-canvas";
    document.body.append(iframe);
    loadModule();
    const button = header.querySelector(".kt-editor-theme-toggle") as HTMLButtonElement;

    button.click();

    const frameDoc = iframe.contentDocument;
    expect(frameDoc?.documentElement.classList.contains("dark-mode")).toBe(true);
    expect(frameDoc?.body.classList.contains("dark-mode")).toBe(true);
  });

  it("re-applies the current mode on the periodic sync interval", () => {
    const header = buildEditorHeader();
    loadModule();
    const button = header.querySelector(".kt-editor-theme-toggle") as HTMLButtonElement;
    button.click();

    const wrapper = document.createElement("div");
    wrapper.className = "editor-styles-wrapper";
    document.body.append(wrapper);
    jest.advanceTimersByTime(1000);

    expect(wrapper.classList.contains("dark-mode")).toBe(true);
  });
});
