function buildMarkup() {
  document.body.innerHTML = `
    <input type="checkbox" id="theme-toggle" />
    <div class="theme-switcher"></div>
    <span class="icon light"></span>
    <span class="icon dark"></span>
  `;
  document.body.className = "";
  document.documentElement.className = "";
}

function mockSystemPrefersDark(prefersDark: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("prefers-color-scheme: dark") ? prefersDark : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function loadModule() {
  jest.resetModules();
  require("./theme-switcher");
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

function setThemeConfig(config: { enabled: boolean; defaultMode: string } | undefined) {
  (window as unknown as { kotlinskidevTheme?: unknown }).kotlinskidevTheme = config;
}

describe("theme-switcher.ts", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSystemPrefersDark(false);
    setThemeConfig(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when the theme-toggle input is missing", () => {
    document.body.innerHTML = "";

    expect(() => loadModule()).not.toThrow();
  });

  it("applies the stored light theme", () => {
    buildMarkup();
    localStorage.setItem("theme", "light");

    loadModule();

    expect(document.body.classList.contains("light-mode")).toBe(true);
    expect((document.getElementById("theme-toggle") as HTMLInputElement).checked).toBe(true);
  });

  it("applies the stored dark theme", () => {
    buildMarkup();
    localStorage.setItem("theme", "dark");

    loadModule();

    expect(document.body.classList.contains("dark-mode")).toBe(true);
    expect((document.getElementById("theme-toggle") as HTMLInputElement).checked).toBe(false);
  });

  it("ignores the stored theme when disabled in config", () => {
    buildMarkup();
    localStorage.setItem("theme", "light");
    setThemeConfig({ enabled: false, defaultMode: "dark" });

    loadModule();

    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  it("uses the configured light default when there is no stored theme", () => {
    buildMarkup();
    setThemeConfig({ enabled: true, defaultMode: "light" });
    mockSystemPrefersDark(true);

    loadModule();

    expect(document.body.classList.contains("light-mode")).toBe(true);
  });

  it("uses the configured dark default when there is no stored theme", () => {
    buildMarkup();
    setThemeConfig({ enabled: true, defaultMode: "dark" });

    loadModule();

    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  it("falls back to the system preference in auto mode when dark is preferred", () => {
    buildMarkup();
    setThemeConfig({ enabled: true, defaultMode: "auto" });
    mockSystemPrefersDark(true);

    loadModule();

    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  it("falls back to light in auto mode when dark is not preferred", () => {
    buildMarkup();
    setThemeConfig({ enabled: true, defaultMode: "auto" });
    mockSystemPrefersDark(false);

    loadModule();

    expect(document.body.classList.contains("light-mode")).toBe(true);
  });

  it("switches to light and persists it when the toggle is checked", () => {
    buildMarkup();
    loadModule();
    const toggle = document.getElementById("theme-toggle") as HTMLInputElement;

    toggle.checked = true;
    toggle.dispatchEvent(new Event("change"));

    expect(document.body.classList.contains("light-mode")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("switches to dark and persists it when the toggle is unchecked", () => {
    buildMarkup();
    loadModule();
    const toggle = document.getElementById("theme-toggle") as HTMLInputElement;

    toggle.checked = false;
    toggle.dispatchEvent(new Event("change"));

    expect(document.body.classList.contains("dark-mode")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("updates icon titles for light and dark mode", () => {
    buildMarkup();
    localStorage.setItem("theme", "light");
    loadModule();

    const lightIcon = document.querySelector(".icon.light") as HTMLElement;
    const darkIcon = document.querySelector(".icon.dark") as HTMLElement;
    expect(lightIcon.getAttribute("title")).toContain("light mode");
    expect(darkIcon.hasAttribute("title")).toBe(false);
  });

  it("clicks the toggle button on Enter or Space from the switcher", () => {
    buildMarkup();
    loadModule();
    const toggle = document.getElementById("theme-toggle") as HTMLInputElement;
    const switcher = document.querySelector(".theme-switcher") as HTMLElement;
    const clickSpy = jest.spyOn(toggle, "click");

    switcher.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", cancelable: true }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it("ignores other keys on the switcher", () => {
    buildMarkup();
    loadModule();
    const toggle = document.getElementById("theme-toggle") as HTMLInputElement;
    const switcher = document.querySelector(".theme-switcher") as HTMLElement;
    const clickSpy = jest.spyOn(toggle, "click");

    switcher.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", cancelable: true }));

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("applies an OS theme change when auto mode is active and nothing is stored", () => {
    buildMarkup();
    setThemeConfig({ enabled: true, defaultMode: "auto" });
    const mediaQueryMock = { matches: false, media: "", addEventListener: jest.fn() };
    (window.matchMedia as jest.Mock).mockReturnValue(mediaQueryMock);

    loadModule();
    const [, handler] = mediaQueryMock.addEventListener.mock.calls[0];
    handler({ matches: true });

    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  it("ignores an OS theme change once a theme has been explicitly stored", () => {
    buildMarkup();
    setThemeConfig({ enabled: true, defaultMode: "auto" });
    const mediaQueryMock = { matches: false, media: "", addEventListener: jest.fn() };
    (window.matchMedia as jest.Mock).mockReturnValue(mediaQueryMock);

    loadModule();
    localStorage.setItem("theme", "light");
    const [, handler] = mediaQueryMock.addEventListener.mock.calls[0];
    handler({ matches: true });

    expect(document.body.classList.contains("light-mode")).toBe(true);
  });

  it("ignores an OS theme change when defaultMode is not auto", () => {
    buildMarkup();
    setThemeConfig({ enabled: true, defaultMode: "dark" });
    const mediaQueryMock = { matches: false, media: "", addEventListener: jest.fn() };
    (window.matchMedia as jest.Mock).mockReturnValue(mediaQueryMock);

    loadModule();
    const [, handler] = mediaQueryMock.addEventListener.mock.calls[0];
    handler({ matches: false });

    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });
});
