interface PendingLoad {
  selector: string;
  loader: () => Promise<unknown>;
}

const OBSERVER_GRACE_MS = 10000;
const FALLBACK_EVENTS = ["pointerdown", "keydown", "focusin", "scroll"] as const;

const pending: PendingLoad[] = [];
let observer: MutationObserver | null = null;
let graceTimer: ReturnType<typeof setTimeout> | null = null;
let fallbackActive = false;
let fallbackScheduled = false;

const stopObserver = (): void => {
  observer?.disconnect();
  observer = null;
  if (graceTimer !== null) {
    clearTimeout(graceTimer);
    graceTimer = null;
  }
};

const onFallbackEvent = (): void => {
  if (fallbackScheduled) {
    return;
  }
  fallbackScheduled = true;
  requestAnimationFrame(() => {
    fallbackScheduled = false;
    flush();
  });
};

const stopFallback = (): void => {
  if (!fallbackActive) {
    return;
  }
  fallbackActive = false;
  FALLBACK_EVENTS.forEach((type) => document.removeEventListener(type, onFallbackEvent, true));
};

const startFallback = (): void => {
  if (fallbackActive) {
    return;
  }
  fallbackActive = true;
  FALLBACK_EVENTS.forEach((type) =>
    document.addEventListener(type, onFallbackEvent, { capture: true, passive: true })
  );
};

function flush(): void {
  for (let i = pending.length - 1; i >= 0; i--) {
    const entry = pending[i];
    if (document.querySelector(entry.selector)) {
      pending.splice(i, 1);
      void entry.loader();
    }
  }

  if (pending.length === 0) {
    stopObserver();
    stopFallback();
  }
}

const handoffToFallback = (): void => {
  stopObserver();
  flush();
  if (pending.length > 0) {
    startFallback();
  }
};

const scheduleGrace = (): void => {
  const arm = (): void => {
    graceTimer = setTimeout(handoffToFallback, OBSERVER_GRACE_MS);
  };
  if (document.readyState === "complete") {
    arm();
  } else {
    window.addEventListener("load", arm, { once: true });
  }
};

const startObserving = (): void => {
  if (observer) {
    return;
  }
  observer = new MutationObserver(flush);
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleGrace();
};

export const loadWhenPresent = (selector: string, loader: () => Promise<unknown>): void => {
  pending.push({ selector, loader });

  const run = (): void => {
    flush();
    if (pending.length > 0) {
      startObserving();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
};
