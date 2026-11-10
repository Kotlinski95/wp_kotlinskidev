const SOLID_CLASS = "kt-nav-solid";
const RELEASE_DELAY_MS = 150;
const MAX_SOLID_MS = 2000;

interface FinishableTransition {
  finished?: Promise<unknown>;
}

export const initNavSolidTransition = (): void => {
  const root = document.documentElement;
  let released = false;

  const release = (): void => {
    if (released) {
      return;
    }
    released = true;
    window.setTimeout(() => root.classList.remove(SOLID_CLASS), RELEASE_DELAY_MS);
  };

  const hold = (): void => {
    released = false;
    root.classList.add(SOLID_CLASS);
  };

  const onPageReveal = (event: Event): void => {
    const transition = (event as Event & { viewTransition?: FinishableTransition | null })
      .viewTransition;
    if (transition?.finished) {
      transition.finished.then(release, release);
    }
  };

  const onPageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) {
      released = false;
      release();
    }
  };

  hold();
  window.setTimeout(release, MAX_SOLID_MS);

  try {
    window.addEventListener("load", release, { once: true });
    window.addEventListener("pageswap", hold);
    window.addEventListener("pagereveal", onPageReveal);
    window.addEventListener("pageshow", onPageShow);
  } catch {
    root.classList.remove(SOLID_CLASS);
  }
};
