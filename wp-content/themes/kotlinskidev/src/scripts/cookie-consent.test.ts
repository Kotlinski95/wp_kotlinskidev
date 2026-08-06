import { replaceCookieConsentButton, initCookieConsentReplacement } from "./cookie-consent";

function buildConsentButton(text = "Manage Cookie Consent") {
  document.body.innerHTML = "";
  const button = document.createElement("button");
  button.className = "cmplz-btn cmplz-manage-consent";
  button.textContent = text;
  document.body.append(button);
  return button;
}

function buildLogoLink() {
  document.body.innerHTML = `
    <div id="cmplz-cookiebanner-1-optin">
      <div class="cmplz-logo">
        <a class="custom-logo-link" href="/"></a>
      </div>
    </div>
  `;
  return document.querySelector(".custom-logo-link") as HTMLAnchorElement;
}

describe("replaceCookieConsentButton", () => {
  afterEach(() => {
    delete (window as unknown as { kotlinskiTheme?: unknown }).kotlinskiTheme;
    document.body.innerHTML = "";
  });

  it("does nothing when the consent button is not present", () => {
    document.body.innerHTML = "";

    expect(() => replaceCookieConsentButton()).not.toThrow();
  });

  it("replaces the button's text content with a cookie icon image", () => {
    const button = buildConsentButton();

    replaceCookieConsentButton();

    const img = button.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.alt).toBe("Cookie consent");
  });

  it("uses the theme's configured images URL for the icon when available", () => {
    (window as unknown as { kotlinskiTheme?: unknown }).kotlinskiTheme = {
      imagesUrl: "https://example.com/assets/images",
    };
    const button = buildConsentButton();

    replaceCookieConsentButton();

    expect(button.querySelector("img")?.src).toBe("https://example.com/assets/images/cookie.svg");
  });

  it("falls back to a default icon path when no theme config is present", () => {
    const button = buildConsentButton();

    replaceCookieConsentButton();

    expect(button.querySelector("img")?.getAttribute("src")).toBe(
      "/wp-content/themes/active/assets/images/cookie.svg"
    );
  });

  it("sets an aria-label from the original button text when none exists", () => {
    const button = buildConsentButton("Manage Cookies");

    replaceCookieConsentButton();

    expect(button.getAttribute("aria-label")).toBe("Manage Cookies");
    expect(button.getAttribute("title")).toBe("Manage Cookies");
  });

  it("keeps an existing aria-label instead of overwriting it", () => {
    const button = buildConsentButton("Manage Cookies");
    button.setAttribute("aria-label", "Custom label");

    replaceCookieConsentButton();

    expect(button.getAttribute("aria-label")).toBe("Custom label");
  });

  it("marks the button as modified so it is not processed twice", () => {
    const button = buildConsentButton();

    replaceCookieConsentButton();
    const firstImg = button.querySelector("img");
    replaceCookieConsentButton();
    const images = button.querySelectorAll("img");

    expect(images).toHaveLength(1);
    expect(images[0]).toBe(firstImg);
  });

  it("warns instead of throwing when DOM access fails", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const querySelectorSpy = jest.spyOn(document, "querySelector").mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => replaceCookieConsentButton()).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      "Failed to replace cookie consent button:",
      expect.any(Error)
    );

    querySelectorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});

describe("initCookieConsentReplacement", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

  it("replaces the consent button and labels the logo after the initial delay", () => {
    const button = buildConsentButton();
    const logoLink = document.createElement("a");
    logoLink.className = "custom-logo-link";
    const bannerWrapper = document.createElement("div");
    bannerWrapper.id = "cmplz-cookiebanner-1-optin";
    const logoWrapper = document.createElement("div");
    logoWrapper.className = "cmplz-logo";
    logoWrapper.append(logoLink);
    bannerWrapper.append(logoWrapper);
    document.body.append(bannerWrapper);

    initCookieConsentReplacement();
    jest.advanceTimersByTime(500);

    expect(button.querySelector("img")).not.toBeNull();
    expect(logoLink.getAttribute("aria-label")).not.toBeNull();
  });

  it("does not throw when there is nothing to replace or label", () => {
    document.body.innerHTML = "";

    expect(() => {
      initCookieConsentReplacement();
      jest.advanceTimersByTime(500);
    }).not.toThrow();
  });

  it("replaces a consent button added later via a DOM mutation", async () => {
    jest.useRealTimers();
    document.body.innerHTML = "";
    initCookieConsentReplacement();

    const button = document.createElement("button");
    button.className = "cmplz-btn cmplz-manage-consent";
    document.body.append(button);
    await new Promise((resolve) => setTimeout(resolve, 150));
    jest.useFakeTimers();

    expect(button.querySelector("img")).not.toBeNull();
  });
});

describe("labelCookieBannerLogo (via replaceCookieConsentButton import side effects)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("sets aria-label on the banner logo link using the page title before the pipe", () => {
    const originalTitle = document.title;
    document.title = "Home | kotlinski.dev";
    buildLogoLink();

    initCookieConsentReplacement();

    const link = document.querySelector(".custom-logo-link") as HTMLAnchorElement;
    expect(link.getAttribute("aria-label")).toBe("Home");
    document.title = originalTitle;
  });
});
