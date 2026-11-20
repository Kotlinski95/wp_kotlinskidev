import { logConsoleBanner } from "./console-banner";

function stubNavigationTiming(loadEventEnd: number): void {
  Object.defineProperty(window.performance, "getEntriesByType", {
    value: () => [{ loadEventEnd }],
    configurable: true,
  });
}

describe("console-banner.ts", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    expect(console).toHaveLogged();
    jest.useRealTimers();
    jest.restoreAllMocks();
    Reflect.deleteProperty(window.performance, "getEntriesByType");
  });

  it("prints the banner exactly as before", () => {
    logConsoleBanner();

    expect(logSpy.mock.calls).toMatchSnapshot();
  });

  it("logs the load time on the next tick when the page is already complete", () => {
    stubNavigationTiming(1234.4);
    Object.defineProperty(document, "readyState", { value: "complete", configurable: true });

    logConsoleBanner();
    const bannerCalls = logSpy.mock.calls.length;
    jest.runOnlyPendingTimers();

    expect(logSpy.mock.calls).toHaveLength(bannerCalls + 1);
    expect(logSpy.mock.calls[bannerCalls]).toMatchSnapshot();
  });

  it("waits for the load event while the page is loading", () => {
    stubNavigationTiming(500);
    Object.defineProperty(document, "readyState", { value: "loading", configurable: true });

    logConsoleBanner();
    const bannerCalls = logSpy.mock.calls.length;
    jest.runOnlyPendingTimers();
    expect(logSpy.mock.calls).toHaveLength(bannerCalls);

    window.dispatchEvent(new Event("load"));
    jest.runOnlyPendingTimers();

    expect(logSpy.mock.calls).toHaveLength(bannerCalls + 1);
  });

  it("skips the load time when the navigation entry has not finished", () => {
    stubNavigationTiming(0);
    Object.defineProperty(document, "readyState", { value: "complete", configurable: true });

    logConsoleBanner();
    const bannerCalls = logSpy.mock.calls.length;
    jest.runOnlyPendingTimers();

    expect(logSpy.mock.calls).toHaveLength(bannerCalls);
  });
});
