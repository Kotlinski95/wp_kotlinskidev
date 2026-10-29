import { metaPixelProvider } from "./meta-pixel-provider";

describe("meta-pixel-provider.ts", () => {
  let fbqMock: jest.Mock;

  beforeEach(() => {
    fbqMock = jest.fn();
  });

  afterEach(() => {
    delete (window as unknown as { fbq?: unknown }).fbq;
  });

  it("is not ready when fbq is unavailable", () => {
    delete (window as unknown as { fbq?: unknown }).fbq;

    expect(metaPixelProvider.isReady()).toBe(false);
  });

  it("is ready once fbq is available", () => {
    (window as unknown as { fbq?: unknown }).fbq = fbqMock;

    expect(metaPixelProvider.isReady()).toBe(true);
  });

  it("sends a mapped event name as a Meta standard event", () => {
    (window as unknown as { fbq?: unknown }).fbq = fbqMock;

    metaPixelProvider.send("generate_lead", { form_name: "contact_form" });

    expect(fbqMock).toHaveBeenCalledWith("track", "Lead", { form_name: "contact_form" });
  });

  it("sends an unmapped event name as a Meta custom event", () => {
    (window as unknown as { fbq?: unknown }).fbq = fbqMock;

    metaPixelProvider.send("project_view", { item_name: "My Project" });

    expect(fbqMock).toHaveBeenCalledWith("trackCustom", "project_view", {
      item_name: "My Project",
    });
  });
});
