interface MockedApi {
  trackEvent: (name: string, params?: Record<string, string | number | boolean>) => void;
}

function loadModule(): MockedApi {
  jest.resetModules();
  require("./analytics");
  return (window as unknown as { kotlinskiAnalytics: MockedApi }).kotlinskiAnalytics;
}

function click(target: Element): void {
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("analytics.ts", () => {
  let clickListeners: EventListener[];
  const originalAddEventListener = document.addEventListener.bind(document);
  let gtagMock: jest.Mock;

  beforeEach(() => {
    clickListeners = [];
    jest.spyOn(document, "addEventListener").mockImplementation((type, listener, options) => {
      if (type === "click") {
        clickListeners.push(listener as EventListener);
      }
      return originalAddEventListener(type, listener as EventListener, options);
    });

    gtagMock = jest.fn();
    (window as unknown as { gtag?: unknown }).gtag = gtagMock;
    document.body.className = "";
    document.body.innerHTML = "";
  });

  afterEach(() => {
    clickListeners.forEach((listener) => document.removeEventListener("click", listener));
    jest.restoreAllMocks();
    delete (window as unknown as { gtag?: unknown }).gtag;
    document.body.innerHTML = "";
    document.body.className = "";
  });

  it("does not call gtag when it is not available", () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    const api = loadModule();

    api.trackEvent("cta_click", { link_text: "Hire Me" });

    expect(gtagMock).not.toHaveBeenCalled();
  });

  it("forwards trackEvent calls to gtag", () => {
    const api = loadModule();

    api.trackEvent("cta_click", { link_text: "Hire Me" });

    expect(gtagMock).toHaveBeenCalledWith("event", "cta_click", { link_text: "Hire Me" });
  });

  it("fires the explicit data-ga-event with snake_cased dataset params", () => {
    loadModule();
    document.body.innerHTML = `
      <button data-ga-event="form_start" data-ga-item-name="Contact Form">Start</button>
    `;

    click(document.querySelector("button")!);

    expect(gtagMock).toHaveBeenCalledWith("event", "form_start", { item_name: "Contact Form" });
  });

  it("fires language_switch for a language panel link", () => {
    loadModule();
    document.body.innerHTML = `
      <ul class="kt-lang-panel__list">
        <li><a class="wp-block-navigation-item__content" hreflang="pl-PL" href="http://kotlinskidev.local/pl/">PL</a></li>
      </ul>
    `;

    click(document.querySelector("a")!);

    expect(gtagMock).toHaveBeenCalledWith("event", "language_switch", {
      language: "pl-PL",
      link_url: "http://kotlinskidev.local/pl/",
    });
  });

  it("fires select_content once for a click inside a project card, not cta_click too", () => {
    loadModule();
    document.body.innerHTML = `
      <div class="kt-project-card">
        <h3>My Project</h3>
        <div class="wp-block-button kt-project-card__link">
          <a class="wp-block-button__link" href="http://kotlinskidev.local/projects/my-project/">View project</a>
        </div>
      </div>
    `;

    click(document.querySelector(".wp-block-button__link")!);

    expect(gtagMock).toHaveBeenCalledTimes(1);
    expect(gtagMock).toHaveBeenCalledWith("event", "select_content", {
      content_type: "project",
      item_name: "My Project",
    });
  });

  it("fires cta_click for a generic button-styled link outside a project card", () => {
    loadModule();
    document.body.innerHTML = `
      <a class="wp-block-button__link" href="http://kotlinskidev.local/contact/">Hire Me</a>
    `;

    click(document.querySelector("a")!);

    expect(gtagMock).toHaveBeenCalledWith("event", "cta_click", {
      link_text: "Hire Me",
      link_url: "http://kotlinskidev.local/contact/",
    });
  });

  it("fires cookie_consent_click for the Complianz consent-manage button", () => {
    loadModule();
    document.body.innerHTML = `<button class="cmplz-btn cmplz-manage-consent">Cookie</button>`;

    click(document.querySelector("button")!);

    expect(gtagMock).toHaveBeenCalledWith("event", "cookie_consent_click", {});
  });

  it("fires accessibility_toggle_click for the OneTap accessibility trigger", () => {
    loadModule();
    document.body.innerHTML = `<button class="onetap-toggle" aria-label="Toggle Accessibility Toolbar"></button>`;

    click(document.querySelector("button")!);

    expect(gtagMock).toHaveBeenCalledWith("event", "accessibility_toggle_click", {});
  });

  it("fires page_not_found on load when the body has the error404 class", () => {
    document.body.className = "error404";

    loadModule();

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "page_not_found",
      expect.objectContaining({ page_location: expect.any(String) })
    );
  });

  it("does not fire page_not_found on a normal page", () => {
    document.body.className = "home";

    loadModule();

    expect(gtagMock).not.toHaveBeenCalledWith("event", "page_not_found", expect.anything());
  });
});
