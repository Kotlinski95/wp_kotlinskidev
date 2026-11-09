import { isWebKitBrowser } from "./is-webkit-browser";

const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
  iphoneFirefox:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  ipod: "Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  ipadOsDesktop:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  macChrome:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  winEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  winFirefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  androidFirefox: "Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0",
};

describe("isWebKitBrowser", () => {
  it.each([
    ["iPhone Safari", UA.iphoneSafari],
    ["Chrome on iOS", UA.iphoneChrome],
    ["Firefox on iOS", UA.iphoneFirefox],
    ["iPad", UA.ipad],
    ["iPod", UA.ipod],
  ])("detects %s", (_label, ua) => {
    expect(isWebKitBrowser(ua, 5)).toBe(true);
  });

  it("detects iPadOS desktop-class UA via touch points", () => {
    expect(isWebKitBrowser(UA.ipadOsDesktop, 5)).toBe(true);
  });

  it("detects desktop Safari", () => {
    expect(isWebKitBrowser(UA.macSafari, 0)).toBe(true);
  });

  it.each([
    ["desktop Chrome", UA.macChrome],
    ["Edge", UA.winEdge],
    ["desktop Firefox", UA.winFirefox],
    ["Android Chrome", UA.androidChrome],
    ["Android Firefox", UA.androidFirefox],
  ])("rejects %s", (_label, ua) => {
    expect(isWebKitBrowser(ua, 0)).toBe(false);
  });

  it("reads navigator by default", () => {
    expect(typeof isWebKitBrowser()).toBe("boolean");
  });
});
