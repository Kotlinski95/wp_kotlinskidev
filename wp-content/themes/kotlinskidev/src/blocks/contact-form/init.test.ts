jest.mock("../../scripts/track-event", () => ({
  trackEvent: jest.fn(),
}));

function loadModule(): void {
  jest.resetModules();
  require("./init");
}

describe("contact-form init.ts", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form class="contact-form-ts">
        <input type="text" name="name" />
        <input type="email" name="email" />
      </form>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("fires form_start on the first focus into the form", () => {
    loadModule();
    const trackEvent = require("../../scripts/track-event").trackEvent as jest.Mock;
    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]')!;

    nameInput.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

    expect(trackEvent).toHaveBeenCalledWith("form_start", { form_name: "contact_form" });
  });

  it("fires form_start only once across multiple field focuses", () => {
    loadModule();
    const trackEvent = require("../../scripts/track-event").trackEvent as jest.Mock;
    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]')!;
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]')!;

    nameInput.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    emailInput.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  it("does not fire form_start when no contact form is present", () => {
    document.body.innerHTML = "";

    loadModule();

    const trackEvent = require("../../scripts/track-event").trackEvent as jest.Mock;
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
