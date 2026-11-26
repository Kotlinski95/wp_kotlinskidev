export interface InViewBandConfig {
  enabled: boolean;
  center: number;
  size: number;
  links: boolean;
}

export interface ObserveCentreBandOptions {
  exclusive?: boolean;
}

interface ThemeWindow {
  kotlinskiTheme?: { inViewBand?: Partial<InViewBandConfig> };
}

export const DEFAULT_IN_VIEW_BAND: InViewBandConfig = {
  enabled: true,
  center: 50,
  size: 30,
  links: false,
};

export const BAND_THRESHOLDS: number[] = [0, 0.25, 0.5, 0.75, 1];

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const readInViewBandConfig = (): InViewBandConfig => {
  const raw = (window as unknown as ThemeWindow).kotlinskiTheme?.inViewBand;
  if (!raw) {
    return { ...DEFAULT_IN_VIEW_BAND };
  }
  return {
    enabled: raw.enabled !== false,
    center: isFiniteNumber(raw.center) ? clamp(raw.center, 0, 100) : DEFAULT_IN_VIEW_BAND.center,
    size: isFiniteNumber(raw.size) ? clamp(raw.size, 1, 100) : DEFAULT_IN_VIEW_BAND.size,
    links: raw.links === true,
  };
};

export const bandRootMargin = (config: InViewBandConfig): string => {
  const top = Math.max(0, config.center - config.size / 2);
  const bottom = Math.max(0, 100 - config.center - config.size / 2);
  return `-${top}% 0px -${bottom}% 0px`;
};

const distanceToBandCentre = (element: Element, centre: number): number => {
  const rect = element.getBoundingClientRect();
  return Math.abs(rect.top + rect.height / 2 - (window.innerHeight * centre) / 100);
};

export const SWITCH_DEBOUNCE_MS = 150;

export interface CentreBandController {
  update: (elements: Element[]) => void;
  disconnect: () => void;
}

interface BandState {
  config: InViewBandConfig;
  onActiveChange: (element: Element, active: boolean) => void;
  intersecting: Set<Element>;
  active: Set<Element>;
  inViewport: Set<Element>;
  tracked: Set<Element>;
  pending: Element | null;
  switchTimer: ReturnType<typeof setTimeout> | null;
}

const cancelSwitch = (state: BandState): void => {
  if (state.switchTimer !== null) {
    clearTimeout(state.switchTimer);
    state.switchTimer = null;
  }
  state.pending = null;
};

const deactivate = (state: BandState, element: Element): void => {
  state.active.delete(element);
  state.onActiveChange(element, false);
};

const activate = (state: BandState, element: Element): void => {
  state.active.add(element);
  state.onActiveChange(element, true);
};

const activateOnly = (state: BandState, target: Element | null): void => {
  state.active.forEach((element) => {
    if (element !== target) {
      deactivate(state, element);
    }
  });
  if (target && !state.active.has(target)) {
    activate(state, target);
  }
};

const nearestToCentre = (state: BandState): Element | null => {
  let best: Element | null = null;
  let bestDistance = Infinity;
  state.intersecting.forEach((element) => {
    const distance = distanceToBandCentre(element, state.config.center);
    if (distance < bestDistance) {
      best = element;
      bestDistance = distance;
    }
  });
  return best;
};

const scheduleSwitch = (state: BandState, best: Element): void => {
  cancelSwitch(state);
  state.pending = best;
  state.switchTimer = setTimeout(() => {
    const target = state.pending;
    state.switchTimer = null;
    state.pending = null;
    if (target && state.inViewport.has(target)) {
      activateOnly(state, target);
    }
  }, SWITCH_DEBOUNCE_MS);
};

const settleExclusive = (state: BandState): void => {
  const best = nearestToCentre(state);
  if (!best || state.active.has(best)) {
    cancelSwitch(state);
    return;
  }
  if (state.active.size === 0) {
    cancelSwitch(state);
    activateOnly(state, best);
    return;
  }
  if (state.pending === best) {
    return;
  }
  scheduleSwitch(state, best);
};

const settleAll = (state: BandState): void => {
  state.active.forEach((element) => {
    if (!state.intersecting.has(element)) {
      deactivate(state, element);
    }
  });
  state.intersecting.forEach((element) => {
    if (!state.active.has(element)) {
      activate(state, element);
    }
  });
};

const createBandObserver = (state: BandState, exclusive: boolean): IntersectionObserver =>
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          state.intersecting.add(entry.target);
        } else {
          state.intersecting.delete(entry.target);
        }
      });
      if (exclusive) {
        settleExclusive(state);
      } else {
        settleAll(state);
      }
    },
    { rootMargin: bandRootMargin(state.config), threshold: BAND_THRESHOLDS }
  );

const createViewportObserver = (state: BandState): IntersectionObserver =>
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          state.inViewport.add(entry.target);
          return;
        }
        state.inViewport.delete(entry.target);
        if (state.pending === entry.target) {
          cancelSwitch(state);
        }
        if (state.active.has(entry.target)) {
          deactivate(state, entry.target);
        }
      });
    },
    { rootMargin: "0px", threshold: 0 }
  );

const createState = (onActiveChange: BandState["onActiveChange"]): BandState => ({
  config: readInViewBandConfig(),
  onActiveChange,
  intersecting: new Set<Element>(),
  active: new Set<Element>(),
  inViewport: new Set<Element>(),
  tracked: new Set<Element>(),
  pending: null,
  switchTimer: null,
});

const createTracker = (
  state: BandState,
  bandObserver: IntersectionObserver,
  viewportObserver: IntersectionObserver | null
) => {
  const track = (element: Element): void => {
    state.tracked.add(element);
    bandObserver.observe(element);
    viewportObserver?.observe(element);
  };

  const untrack = (element: Element): void => {
    state.tracked.delete(element);
    bandObserver.unobserve(element);
    viewportObserver?.unobserve(element);
    state.intersecting.delete(element);
    state.inViewport.delete(element);
    if (state.pending === element) {
      cancelSwitch(state);
    }
    if (state.active.delete(element)) {
      state.onActiveChange(element, false);
    }
  };

  return { track, untrack };
};

export const observeCentreBand = (
  elements: Element[],
  onActiveChange: (element: Element, active: boolean) => void,
  { exclusive = false }: ObserveCentreBandOptions = {}
): CentreBandController => {
  if (typeof IntersectionObserver === "undefined") {
    return { update: () => undefined, disconnect: () => undefined };
  }

  const state = createState(onActiveChange);
  const bandObserver = createBandObserver(state, exclusive);
  const viewportObserver = exclusive ? createViewportObserver(state) : null;
  const { track, untrack } = createTracker(state, bandObserver, viewportObserver);

  const update = (next: Element[]): void => {
    const nextSet = new Set(next);
    Array.from(state.tracked).forEach((element) => {
      if (!nextSet.has(element)) {
        untrack(element);
      }
    });
    nextSet.forEach((element) => {
      if (!state.tracked.has(element)) {
        track(element);
      }
    });
  };

  const disconnect = (): void => {
    bandObserver.disconnect();
    viewportObserver?.disconnect();
    cancelSwitch(state);
    state.tracked.clear();
    state.intersecting.clear();
    state.inViewport.clear();
    state.active.forEach((element) => onActiveChange(element, false));
    state.active.clear();
  };

  elements.forEach(track);

  return { update, disconnect };
};
