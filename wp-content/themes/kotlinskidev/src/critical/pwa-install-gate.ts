export const PWA_VIEWS_KEY = "kt-pwa-views";
export const PWA_VISIBLE_MS_KEY = "kt-pwa-visible-ms";
export const PWA_MIN_VIEWS = 2;
export const PWA_MIN_VISIBLE_MS = 30000;
const CONSENT_COOKIE = "cmplz_banner-status";
const TICK_MS = 1000;

type InstallPromptEvent = Event & {
  prompt?: () => Promise<void>;
  userChoice?: Promise<unknown>;
  platforms?: string[];
};

type GatedEvent = InstallPromptEvent & { ktReplayed?: boolean };

const cloneForReplay = (original: GatedEvent): GatedEvent => {
  const clone = new Event("beforeinstallprompt", { cancelable: true }) as GatedEvent;
  Object.defineProperties(clone, {
    ktReplayed: { value: true },
    prompt: { value: () => original.prompt?.() ?? Promise.resolve() },
    userChoice: { get: () => original.userChoice },
    platforms: { get: () => original.platforms ?? [] },
  });
  return clone;
};

const readNumber = (key: string): number => {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
};

const writeNumber = (key: string, value: number): void => {
  try {
    window.localStorage.setItem(key, String(value));
  } catch (error) {
    void error;
  }
};

const consentResolved = (): boolean =>
  document.cookie.split(";").some((part) => part.trim().startsWith(`${CONSENT_COOKIE}=`));

export const initPwaInstallGate = (): (() => void) => {
  let stored: GatedEvent | null = null;
  let replayed = false;

  const views = readNumber(PWA_VIEWS_KEY) + 1;
  writeNumber(PWA_VIEWS_KEY, views);

  let visibleMs = readNumber(PWA_VISIBLE_MS_KEY);
  let visibleSince: number | null = document.visibilityState === "visible" ? Date.now() : null;

  const currentVisibleMs = (): number =>
    visibleMs + (visibleSince === null ? 0 : Date.now() - visibleSince);

  const persistVisible = (): void => {
    visibleMs = currentVisibleMs();
    visibleSince = document.visibilityState === "visible" ? Date.now() : null;
    writeNumber(PWA_VISIBLE_MS_KEY, visibleMs);
  };

  const ready = (): boolean =>
    (views >= PWA_MIN_VIEWS || currentVisibleMs() >= PWA_MIN_VISIBLE_MS) && consentResolved();

  const replay = (): void => {
    if (replayed || !stored || !ready()) {
      return;
    }
    replayed = true;
    window.dispatchEvent(cloneForReplay(stored));
  };

  const capturePrompt = (event: Event): void => {
    const gated = event as GatedEvent;
    if (gated.ktReplayed) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    stored = gated;
    window.setTimeout(replay, 0);
  };

  const onVisibilityChange = (): void => {
    persistVisible();
    replay();
  };

  window.addEventListener("beforeinstallprompt", capturePrompt, true);
  document.addEventListener("visibilitychange", onVisibilityChange);

  window.addEventListener("pagehide", persistVisible);

  const timer = window.setInterval(() => {
    if (replayed) {
      window.clearInterval(timer);
      return;
    }
    replay();
  }, TICK_MS);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener("beforeinstallprompt", capturePrompt, true);
    window.removeEventListener("pagehide", persistVisible);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};
