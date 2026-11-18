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

export const observeCentreBand = (
  elements: Element[],
  onActiveChange: (element: Element, active: boolean) => void,
  { exclusive = false }: ObserveCentreBandOptions = {}
): CentreBandController => {
  if (typeof IntersectionObserver === "undefined") {
    return { update: () => undefined, disconnect: () => undefined };
  }

  const config = readInViewBandConfig();
  const intersecting = new Set<Element>();
  const active = new Set<Element>();
  const inViewport = new Set<Element>();
  const tracked = new Set<Element>();
  let pending: Element | null = null;
  let switchTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelSwitch = (): void => {
    if (switchTimer !== null) {
      clearTimeout(switchTimer);
      switchTimer = null;
    }
    pending = null;
  };

  const activateOnly = (target: Element | null): void => {
    active.forEach((element) => {
      if (element !== target) {
        active.delete(element);
        onActiveChange(element, false);
      }
    });
    if (target && !active.has(target)) {
      active.add(target);
      onActiveChange(target, true);
    }
  };

  const nearestToCentre = (): Element | null => {
    let best: Element | null = null;
    let bestDistance = Infinity;
    intersecting.forEach((element) => {
      const distance = distanceToBandCentre(element, config.center);
      if (distance < bestDistance) {
        best = element;
        bestDistance = distance;
      }
    });
    return best;
  };

  const settleExclusive = (): void => {
    const best = nearestToCentre();
    if (!best || active.has(best)) {
      cancelSwitch();
      return;
    }
    if (active.size === 0) {
      cancelSwitch();
      activateOnly(best);
      return;
    }
    if (pending === best) {
      return;
    }
    cancelSwitch();
    pending = best;
    switchTimer = setTimeout(() => {
      const target = pending;
      switchTimer = null;
      pending = null;
      if (target && inViewport.has(target)) {
        activateOnly(target);
      }
    }, SWITCH_DEBOUNCE_MS);
  };

  const settleAll = (): void => {
    active.forEach((element) => {
      if (!intersecting.has(element)) {
        active.delete(element);
        onActiveChange(element, false);
      }
    });
    intersecting.forEach((element) => {
      if (!active.has(element)) {
        active.add(element);
        onActiveChange(element, true);
      }
    });
  };

  const bandObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersecting.add(entry.target);
        } else {
          intersecting.delete(entry.target);
        }
      });
      if (exclusive) {
        settleExclusive();
      } else {
        settleAll();
      }
    },
    { rootMargin: bandRootMargin(config), threshold: BAND_THRESHOLDS }
  );

  const viewportObserver = exclusive
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              inViewport.add(entry.target);
              return;
            }
            inViewport.delete(entry.target);
            if (pending === entry.target) {
              cancelSwitch();
            }
            if (active.has(entry.target)) {
              active.delete(entry.target);
              onActiveChange(entry.target, false);
            }
          });
        },
        { rootMargin: "0px", threshold: 0 }
      )
    : null;

  const track = (element: Element): void => {
    tracked.add(element);
    bandObserver.observe(element);
    viewportObserver?.observe(element);
  };

  const untrack = (element: Element): void => {
    tracked.delete(element);
    bandObserver.unobserve(element);
    viewportObserver?.unobserve(element);
    intersecting.delete(element);
    inViewport.delete(element);
    if (pending === element) {
      cancelSwitch();
    }
    if (active.delete(element)) {
      onActiveChange(element, false);
    }
  };

  const update = (next: Element[]): void => {
    const nextSet = new Set(next);
    Array.from(tracked).forEach((element) => {
      if (!nextSet.has(element)) {
        untrack(element);
      }
    });
    nextSet.forEach((element) => {
      if (!tracked.has(element)) {
        track(element);
      }
    });
  };

  const disconnect = (): void => {
    bandObserver.disconnect();
    viewportObserver?.disconnect();
    cancelSwitch();
    tracked.clear();
    intersecting.clear();
    inViewport.clear();
    active.forEach((element) => onActiveChange(element, false));
    active.clear();
  };

  elements.forEach(track);

  return { update, disconnect };
};
