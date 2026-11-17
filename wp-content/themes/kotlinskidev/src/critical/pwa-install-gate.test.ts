import {
  PWA_MIN_VIEWS,
  PWA_MIN_VISIBLE_MS,
  PWA_VIEWS_KEY,
  PWA_VISIBLE_MS_KEY,
  initPwaInstallGate,
} from "./pwa-install-gate";

const makePromptEvent = (): Event => new Event("beforeinstallprompt", { cancelable: true });

const setConsent = (): void => {
  document.cookie = "cmplz_banner-status=dismissed; path=/";
};

const clearConsent = (): void => {
  document.cookie = "cmplz_banner-status=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
};

describe("pwa install gate", () => {
  let delivered: jest.Mock;
  let dispose: () => void;

  beforeEach(() => {
    dispose = () => undefined;
    jest.useFakeTimers();
    window.localStorage.clear();
    clearConsent();
    delivered = jest.fn();
  });

  afterEach(() => {
    dispose();
    window.removeEventListener("beforeinstallprompt", delivered);
    jest.useRealTimers();
  });

  const arm = (): void => {
    dispose = initPwaInstallGate();
    window.addEventListener("beforeinstallprompt", delivered);
  };

  it("swallows the first-view prompt event and does not deliver it", () => {
    setConsent();
    arm();
    const event = makePromptEvent();
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(delivered).not.toHaveBeenCalled();
  });

  it("replays once the second page view is reached and consent is resolved", () => {
    window.localStorage.setItem(PWA_VIEWS_KEY, String(PWA_MIN_VIEWS - 1));
    setConsent();
    arm();
    window.dispatchEvent(makePromptEvent());
    jest.advanceTimersByTime(0);
    expect(delivered).toHaveBeenCalledTimes(1);
  });

  it("holds the replay on view two until consent resolves", () => {
    window.localStorage.setItem(PWA_VIEWS_KEY, String(PWA_MIN_VIEWS - 1));
    arm();
    window.dispatchEvent(makePromptEvent());
    expect(delivered).not.toHaveBeenCalled();
    setConsent();
    jest.advanceTimersByTime(1000);
    expect(delivered).toHaveBeenCalledTimes(1);
  });

  it("replays after the visible time threshold on the first view", () => {
    setConsent();
    arm();
    window.dispatchEvent(makePromptEvent());
    jest.advanceTimersByTime(PWA_MIN_VISIBLE_MS);
    expect(delivered).toHaveBeenCalledTimes(1);
  });

  it("counts page views in localStorage", () => {
    arm();
    expect(window.localStorage.getItem(PWA_VIEWS_KEY)).toBe("1");
  });

  it("replays only once", () => {
    window.localStorage.setItem(PWA_VIEWS_KEY, String(PWA_MIN_VIEWS));
    setConsent();
    arm();
    window.dispatchEvent(makePromptEvent());
    jest.advanceTimersByTime(5000);
    expect(delivered).toHaveBeenCalledTimes(1);
  });

  it("persists visible time when the tab is hidden", () => {
    arm();
    jest.advanceTimersByTime(4000);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(Number(window.localStorage.getItem(PWA_VISIBLE_MS_KEY))).toBeGreaterThanOrEqual(0);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });
});
