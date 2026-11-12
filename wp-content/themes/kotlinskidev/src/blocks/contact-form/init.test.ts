jest.mock("../../scripts/track-event", () => ({
  trackEvent: jest.fn(),
}));

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function mockNonceFetch(nonce: string | null): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(nonce ? { success: true, data: { nonce } } : { success: false }),
  });
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
  return fetchMock;
}

function loadModule(): void {
  jest.resetModules();
  require("./init");
}

describe("contact-form init.ts", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form class="contact-form-ts" data-nonce-url="/wp-admin/admin-ajax.php?action=nonce">
        <input type="hidden" name="kotlinskidev_contact_form_nonce" value="stale" />
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

  it("replaces the cached nonce with a fresh one on load", async () => {
    const fetchMock = mockNonceFetch("fresh123");
    loadModule();
    await flush();

    expect(fetchMock).toHaveBeenCalledWith("/wp-admin/admin-ajax.php?action=nonce", {
      cache: "no-store",
      credentials: "same-origin",
    });
    expect(
      document.querySelector<HTMLInputElement>('input[name="kotlinskidev_contact_form_nonce"]')!
        .value
    ).toBe("fresh123");
  });

  it("keeps the rendered nonce when the refresh request fails", async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockRejectedValue(new Error("x"));
    loadModule();
    await flush();

    expect(
      document.querySelector<HTMLInputElement>('input[name="kotlinskidev_contact_form_nonce"]')!
        .value
    ).toBe("stale");
  });

  it("refreshes the nonce before submitting when the first refresh never succeeded", async () => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockRejectedValue(new Error("x"));
    loadModule();
    await flush();
    const form = document.querySelector<HTMLFormElement>(".contact-form-ts")!;
    form.submit = jest.fn();
    mockNonceFetch("latest456");

    const event = new Event("submit", { cancelable: true });
    form.dispatchEvent(event);
    await flush();

    expect(event.defaultPrevented).toBe(true);
    expect(form.submit).toHaveBeenCalledTimes(1);
    expect(
      document.querySelector<HTMLInputElement>('input[name="kotlinskidev_contact_form_nonce"]')!
        .value
    ).toBe("latest456");
  });

  it("submits normally when the nonce is fresh", async () => {
    mockNonceFetch("fresh123");
    loadModule();
    await flush();
    const form = document.querySelector<HTMLFormElement>(".contact-form-ts")!;
    form.submit = jest.fn();

    const event = new Event("submit", { cancelable: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(form.submit).not.toHaveBeenCalled();
  });
});
