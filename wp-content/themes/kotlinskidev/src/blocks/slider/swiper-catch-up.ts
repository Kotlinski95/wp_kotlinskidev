import type Swiper from "swiper";
import { asTranslateControl, readTranslateXAcceptingWebKitMatrix3d } from "./swiper-translate";

const MIN_CATCH_UP_DURATION_MS = 50;

export interface AutoplayPace {
  speed: number;
  reverse: boolean;
}

export interface FrozenPosition {
  targetIndex: number;
  frozenTranslateX: number;
}

export interface CatchUpTarget {
  translateX: number;
  duration: number;
}

const measureStepDistance = (grid: number[] | undefined): number =>
  Math.abs((grid?.[1] ?? 0) - (grid?.[0] ?? 0));

const scaleDurationByRatio = (fullSpeed: number, ratio: number): number =>
  Math.max(fullSpeed * ratio, MIN_CATCH_UP_DURATION_MS);

function findNearestOtherSnapIndex(swiper: Swiper, translateX: number): number {
  const grid = asTranslateControl(swiper).snapGrid;
  if (!grid?.length) {
    return 0;
  }
  const target = -translateX;
  let closestIndex = -1;
  let closestDistance = Infinity;
  grid.forEach((position, index) => {
    if (index === swiper.activeIndex) {
      return;
    }
    const distance = Math.abs(position - target);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex === -1 ? 0 : closestIndex;
}

const slideInDirection = (swiper: Swiper, speed: number, reverse: boolean) =>
  reverse ? swiper.slidePrev(speed, true, true) : swiper.slideNext(speed, true, true);

export function advanceOrWrapToNearestSnap(
  swiper: Swiper,
  speed: number,
  reverse: boolean
): boolean {
  const moved = slideInDirection(swiper, speed, reverse);
  if (moved !== false) {
    return moved;
  }
  const controllable = asTranslateControl(swiper);
  const currentTranslateX = controllable.wrapperEl
    ? readTranslateXAcceptingWebKitMatrix3d(controllable.wrapperEl)
    : 0;
  swiper.slideTo(findNearestOtherSnapIndex(swiper, currentTranslateX), 0, true, true);
  return slideInDirection(swiper, speed, reverse);
}

export function computeCatchUpToIndex(
  swiper: Swiper,
  { targetIndex, frozenTranslateX }: FrozenPosition,
  { speed: fullSpeed, reverse }: AutoplayPace
): CatchUpTarget | null {
  const grid = asTranslateControl(swiper).snapGrid;
  const targetTranslateX = grid?.[targetIndex];
  const stepDistance = measureStepDistance(grid);
  if (typeof targetTranslateX !== "number" || !stepDistance) {
    return null;
  }
  const remainingSigned = targetTranslateX + frozenTranslateX;
  const remainingDistance = Math.abs(remainingSigned);
  const goesWrongWay = reverse ? remainingSigned > 0 : remainingSigned < 0;
  if (goesWrongWay || remainingDistance > stepDistance) {
    return null;
  }
  const ratio = Math.min(remainingDistance / stepDistance, 1);
  return { translateX: -targetTranslateX, duration: scaleDurationByRatio(fullSpeed, ratio) };
}

export function computeCatchUpToNextBoundary(
  swiper: Swiper,
  frozenTranslateX: number,
  { speed: fullSpeed, reverse }: AutoplayPace
): CatchUpTarget | null {
  const grid = asTranslateControl(swiper).snapGrid;
  const stepDistance = measureStepDistance(grid);
  if (!grid?.length || !stepDistance) {
    return null;
  }
  const traveled = -frozenTranslateX;
  const nextBoundary = reverse
    ? ([...grid].reverse().find((position) => position < traveled) ?? traveled - stepDistance)
    : (grid.find((position) => position > traveled) ?? traveled + stepDistance);
  const remainingDistance = Math.abs(nextBoundary - traveled);
  const ratio = Math.min(Math.max(remainingDistance / stepDistance, 0), 1);
  return { translateX: -nextBoundary, duration: scaleDurationByRatio(fullSpeed, ratio) };
}

export function animateCatchUpThenAdvance(
  swiper: Swiper,
  target: CatchUpTarget,
  { speed: fullSpeed, reverse }: AutoplayPace
): void {
  const controllable = asTranslateControl(swiper);
  const wrapperEl = controllable.wrapperEl;
  if (!wrapperEl) {
    advanceOrWrapToNearestSnap(swiper, fullSpeed, reverse);
    return;
  }
  controllable.setTransition(target.duration);
  controllable.setTranslate(target.translateX);
  controllable.animating = true;
  const onCatchUpEnd = (event: Event) => {
    if (event.target !== wrapperEl) {
      return;
    }
    wrapperEl.removeEventListener("transitionend", onCatchUpEnd);
    if (swiper.destroyed) {
      return;
    }
    advanceOrWrapToNearestSnap(swiper, fullSpeed, reverse);
  };
  wrapperEl.addEventListener("transitionend", onCatchUpEnd);
}
