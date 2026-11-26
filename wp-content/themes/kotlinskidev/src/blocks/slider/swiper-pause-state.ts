import type Swiper from "swiper";
import {
  advanceOrWrapToNearestSnap,
  animateCatchUpThenAdvance,
  computeCatchUpToIndex,
  computeCatchUpToNextBoundary,
  type AutoplayPace,
  type CatchUpTarget,
} from "./swiper-catch-up";
import { asTranslateControl, freezeAtCurrentPosition } from "./swiper-translate";

export interface PauseReasons {
  hovered: boolean;
  focused: boolean;
  pressed: boolean;
  modalOpen: boolean;
  touchPinned: boolean;
}

export interface ResumeMemory {
  midTransition: boolean;
  targetIndex: number;
  frozenTranslateX: number;
  dragEndedTranslateX: number | null;
}

export interface ContinuousAutoplayState {
  reasons: PauseReasons;
  resume: ResumeMemory;
  isPaused: boolean;
  touchStarted: boolean;
}

export const hasPauseReason = (reasons: PauseReasons): boolean =>
  reasons.hovered || reasons.focused || reasons.pressed || reasons.modalOpen || reasons.touchPinned;

export const hasNoGenuinePauseReasonLeft = (reasons: PauseReasons): boolean =>
  !reasons.hovered && !reasons.pressed && !reasons.modalOpen && !reasons.touchPinned;

export function createInitialState(): ContinuousAutoplayState {
  return {
    reasons: {
      hovered: false,
      focused: false,
      pressed: false,
      modalOpen: false,
      touchPinned: false,
    },
    resume: {
      midTransition: false,
      targetIndex: -1,
      frozenTranslateX: 0,
      dragEndedTranslateX: null,
    },
    isPaused: false,
    touchStarted: false,
  };
}

function advanceOrCatchUp(swiper: Swiper, target: CatchUpTarget | null, pace: AutoplayPace): void {
  if (target) {
    animateCatchUpThenAdvance(swiper, target, pace);
  } else {
    advanceOrWrapToNearestSnap(swiper, pace.speed, pace.reverse);
  }
}

function freezeForPause(swiper: Swiper, state: ContinuousAutoplayState): void {
  state.resume.midTransition = asTranslateControl(swiper).animating;
  state.resume.frozenTranslateX = freezeAtCurrentPosition(swiper);
  state.resume.targetIndex = swiper.activeIndex;
  swiper.autoplay.pause();
}

function resumeFromPause(swiper: Swiper, state: ContinuousAutoplayState, pace: AutoplayPace): void {
  const { resume } = state;
  if (resume.dragEndedTranslateX !== null) {
    const target = computeCatchUpToNextBoundary(swiper, resume.dragEndedTranslateX, pace);
    resume.dragEndedTranslateX = null;
    advanceOrCatchUp(swiper, target, pace);
    return;
  }
  if (resume.midTransition) {
    advanceOrCatchUp(swiper, computeCatchUpToIndex(swiper, resume, pace), pace);
    return;
  }
  advanceOrWrapToNearestSnap(swiper, pace.speed, pace.reverse);
}

export function createEvaluate(
  swiper: Swiper,
  state: ContinuousAutoplayState,
  pace: AutoplayPace
): () => void {
  return () => {
    const shouldPause = hasPauseReason(state.reasons);
    if (shouldPause === state.isPaused) {
      return;
    }
    state.isPaused = shouldPause;
    if (shouldPause) {
      freezeForPause(swiper, state);
    } else {
      resumeFromPause(swiper, state, pace);
    }
  };
}
