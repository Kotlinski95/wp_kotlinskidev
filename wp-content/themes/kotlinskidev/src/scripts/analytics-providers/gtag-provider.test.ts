import { gtagProvider } from "./gtag-provider";

describe("gtag-provider.ts", () => {
  let gtagMock: jest.Mock;

  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("is not ready when gtag is unavailable", () => {
    delete (window as unknown as { gtag?: unknown }).gtag;

    expect(gtagProvider.isReady()).toBe(false);
  });

  it("is ready once gtag is available", () => {
    gtagMock = jest.fn();
    (window as unknown as { gtag?: unknown }).gtag = gtagMock;

    expect(gtagProvider.isReady()).toBe(true);
  });

  it("sends the event name and params through to gtag verbatim", () => {
    gtagMock = jest.fn();
    (window as unknown as { gtag?: unknown }).gtag = gtagMock;

    gtagProvider.send("cta_click", { link_text: "Hire Me" });

    expect(gtagMock).toHaveBeenCalledWith("event", "cta_click", { link_text: "Hire Me" });
  });
});
