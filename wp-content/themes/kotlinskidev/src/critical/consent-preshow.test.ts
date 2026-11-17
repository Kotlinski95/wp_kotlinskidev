import { CMPLZ_PENDING_CLASS, CMPLZ_RELEASED_EVENT, initConsentPreshow } from "./consent-preshow";

const setDoNotTrack = (value: string | null): void => {
  Object.defineProperty(navigator, "doNotTrack", { configurable: true, value });
};

const clearConsentCookie = (): void => {
  document.cookie = "cmplz_banner-status=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
};

describe("consent preshow", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    clearConsentCookie();
    setDoNotTrack(null);
    jest.useFakeTimers();
    Object.defineProperty(document, "readyState", { configurable: true, get: () => "complete" });
  });

  let release: () => void = () => undefined;

  afterEach(() => {
    release();
    release = () => undefined;
    jest.useRealTimers();
    delete (document as unknown as Record<string, unknown>).readyState;
  });

  it("adds the pending class for a first-time visitor", () => {
    release = initConsentPreshow();
    expect(document.documentElement.classList.contains(CMPLZ_PENDING_CLASS)).toBe(true);
  });

  it("skips when the consent cookie exists", () => {
    document.cookie = "cmplz_banner-status=dismissed; path=/";
    release = initConsentPreshow();
    expect(document.documentElement.classList.contains(CMPLZ_PENDING_CLASS)).toBe(false);
  });

  it("skips when Do Not Track is on", () => {
    setDoNotTrack("1");
    release = initConsentPreshow();
    expect(document.documentElement.classList.contains(CMPLZ_PENDING_CLASS)).toBe(false);
  });

  it("skips when Global Privacy Control is on", () => {
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
    release = initConsentPreshow();
    expect(document.documentElement.classList.contains(CMPLZ_PENDING_CLASS)).toBe(false);
    delete (navigator as unknown as Record<string, unknown>).globalPrivacyControl;
  });

  it("skips on pages marked by PHP", () => {
    document.head.innerHTML = '<meta name="kt-cmplz-skip" content="1">';
    release = initConsentPreshow();
    expect(document.documentElement.classList.contains(CMPLZ_PENDING_CLASS)).toBe(false);
  });

  it("releases and announces once the banner is shown", async () => {
    const released = jest.fn();
    document.addEventListener(CMPLZ_RELEASED_EVENT, released);
    document.body.innerHTML = '<div class="cmplz-cookiebanner cmplz-hidden"></div>';
    release = initConsentPreshow();

    document.querySelector(".cmplz-cookiebanner")?.classList.remove("cmplz-hidden");
    await Promise.resolve();
    jest.advanceTimersByTime(100);

    expect(document.documentElement.classList.contains(CMPLZ_PENDING_CLASS)).toBe(false);
    expect(released).toHaveBeenCalledTimes(1);
    document.removeEventListener(CMPLZ_RELEASED_EVENT, released);
  });

  it("releases 8 seconds after load when no banner ever appears", () => {
    release = initConsentPreshow();
    jest.advanceTimersByTime(8000);
    expect(document.documentElement.classList.contains(CMPLZ_PENDING_CLASS)).toBe(false);
  });
});
