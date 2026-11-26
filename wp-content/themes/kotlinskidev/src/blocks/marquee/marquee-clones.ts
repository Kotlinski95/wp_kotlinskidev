export interface LifetimeCloneBudget {
  remaining: number;
}

interface SeamlessLoopGrowth {
  track: HTMLElement;
  unit: HTMLElement[];
  shiftDistance: number;
  containerWidth: number;
}

const appendOneRepeatUnit = (track: HTMLElement, unit: HTMLElement[]): void => {
  unit.forEach((item) => {
    track.append(item.cloneNode(true));
  });
};

export const growUntilWideEnoughToLoopSeamlessly = (
  { track, unit, shiftDistance, containerWidth }: SeamlessLoopGrowth,
  budget: LifetimeCloneBudget
): void => {
  while (
    shiftDistance > 0 &&
    track.scrollWidth < shiftDistance + containerWidth &&
    budget.remaining > 0
  ) {
    appendOneRepeatUnit(track, unit);
    budget.remaining -= 1;
  }
};

export const ensureSeamlessLoop = (
  track: HTMLElement,
  container: HTMLElement,
  budget: LifetimeCloneBudget
): number => {
  const realItems = Array.from(track.children) as HTMLElement[];
  const realItemCount = realItems.length;
  if (realItemCount === 0) {
    return 0;
  }

  appendOneRepeatUnit(track, realItems);
  const secondUnitFirstChild = track.children[realItemCount] as HTMLElement;
  const shiftDistance = Math.round(
    secondUnitFirstChild.getBoundingClientRect().left - track.getBoundingClientRect().left
  );

  growUntilWideEnoughToLoopSeamlessly(
    { track, unit: realItems, shiftDistance, containerWidth: container.clientWidth },
    budget
  );

  return shiftDistance;
};

export const markClonesNonTabbable = (track: HTMLElement, realItemCount: number): void => {
  const items = Array.from(track.querySelectorAll<HTMLElement>(".kt-marquee__item"));
  items.slice(realItemCount).forEach((item) => {
    item.setAttribute("aria-hidden", "true");
    item.setAttribute("tabindex", "-1");
  });
};

export const forceEagerImageLoading = (el: HTMLElement): void => {
  el.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    img.loading = "eager";
  });
};
