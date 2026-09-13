import { trackEvent } from "./track-event";

describe("track-event.ts", () => {
  let gtagMock: jest.Mock;
  let fbqMock: jest.Mock;

  beforeEach(() => {
    gtagMock = jest.fn();
    fbqMock = jest.fn();
    (window as unknown as { gtag?: unknown }).gtag = gtagMock;
    (window as unknown as { fbq?: unknown }).fbq = fbqMock;
  });

  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { fbq?: unknown }).fbq;
    delete (window as unknown as { kotlinskiAnalyticsConfig?: unknown }).kotlinskiAnalyticsConfig;
  });

  it("routes an unlisted event to gtag only, even when fbq is available", () => {
    trackEvent("cta_click", { link_text: "Hire Me" });

    expect(gtagMock).toHaveBeenCalledWith("event", "cta_click", { link_text: "Hire Me" });
    expect(fbqMock).not.toHaveBeenCalled();
  });

  it("routes generate_lead to both gtag and the mapped Meta standard event", () => {
    trackEvent("generate_lead", { form_name: "contact_form" });

    expect(gtagMock).toHaveBeenCalledWith("event", "generate_lead", { form_name: "contact_form" });
    expect(fbqMock).toHaveBeenCalledWith("track", "Lead", { form_name: "contact_form" });
  });

  it("skips a routed provider that isn't ready without throwing", () => {
    delete (window as unknown as { fbq?: unknown }).fbq;

    expect(() => trackEvent("generate_lead", {})).not.toThrow();
    expect(gtagMock).toHaveBeenCalledWith("event", "generate_lead", {});
  });

  it("does nothing when no provider is ready", () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { fbq?: unknown }).fbq;

    expect(() => trackEvent("cta_click", {})).not.toThrow();
  });

  it("skips every provider for an event disabled via kotlinskiAnalyticsConfig", () => {
    (window as unknown as { kotlinskiAnalyticsConfig?: unknown }).kotlinskiAnalyticsConfig = {
      disabledEvents: ["generate_lead"],
    };

    trackEvent("generate_lead", { form_name: "contact_form" });

    expect(gtagMock).not.toHaveBeenCalled();
    expect(fbqMock).not.toHaveBeenCalled();
  });

  it("still fires an event not listed in disabledEvents", () => {
    (window as unknown as { kotlinskiAnalyticsConfig?: unknown }).kotlinskiAnalyticsConfig = {
      disabledEvents: ["generate_lead"],
    };

    trackEvent("cta_click", { link_text: "Hire Me" });

    expect(gtagMock).toHaveBeenCalledWith("event", "cta_click", { link_text: "Hire Me" });
  });

  it("treats a missing kotlinskiAnalyticsConfig as nothing disabled", () => {
    delete (window as unknown as { kotlinskiAnalyticsConfig?: unknown }).kotlinskiAnalyticsConfig;

    trackEvent("cta_click", {});

    expect(gtagMock).toHaveBeenCalled();
  });
});
