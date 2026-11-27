import { isAccessibilityMotionStopped } from "@utils/accessibility-motion";
import * as THREE from "three";

const SETTLE_BUFFER_MS = 150;
const DRAG_THRESHOLD_PX = 6;
const MS_PER_SECOND = 1000;

export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || isAccessibilityMotionStopped();

export const resolveClip = (
  animations: THREE.AnimationClip[],
  clipName: string
): THREE.AnimationClip | null => {
  return THREE.AnimationClip.findByName(animations, clipName) ?? animations[0] ?? null;
};

export const computeReducedMotionTargetTime = (pressed: boolean, clipDuration: number): number =>
  pressed ? clipDuration : 0;

export const getSettleDeadline = (now: number, clipDurationMs: number): number =>
  now + clipDurationMs + SETTLE_BUFFER_MS;

export interface PointerPosition {
  x: number;
  y: number;
}

export const hasDragged = (start: PointerPosition, end: PointerPosition): boolean =>
  Math.hypot(end.x - start.x, end.y - start.y) > DRAG_THRESHOLD_PX;

export interface ClipPlayback {
  mixer: THREE.AnimationMixer;
  action: THREE.AnimationAction;
  durationMs: number;
}

export const createClipPlayback = (
  clip: THREE.AnimationClip,
  root: THREE.Object3D
): ClipPlayback => {
  const mixer = new THREE.AnimationMixer(root);
  const action = mixer.clipAction(clip);
  action.clampWhenFinished = true;
  action.loop = THREE.LoopOnce;
  return { mixer, action, durationMs: clip.duration * MS_PER_SECOND };
};

export interface PlaybackController {
  setClip: (playback: ClipPlayback) => void;
  toggle: () => void;
}

const createSettleLoop = (
  getPlayback: () => ClipPlayback | null,
  renderOnce: () => void
): ((settleUntil: number) => void) => {
  let rafId = 0;
  let settleUntil = 0;
  let lastTime = 0;

  const stopLoop = (): void => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const loop = (time: number): void => {
    const playback = getPlayback();
    if (!playback) {
      stopLoop();
      return;
    }
    const delta = lastTime ? (time - lastTime) / MS_PER_SECOND : 0;
    lastTime = time;
    playback.mixer.update(delta);
    renderOnce();

    if (time < settleUntil) {
      rafId = requestAnimationFrame(loop);
    } else {
      stopLoop();
      lastTime = 0;
    }
  };

  return (nextSettleUntil) => {
    settleUntil = nextSettleUntil;
    stopLoop();
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  };
};

const jumpToReducedMotionEnd = (
  { mixer, action }: ClipPlayback,
  isPressed: boolean,
  renderOnce: () => void
): void => {
  action.paused = true;
  action.time = computeReducedMotionTargetTime(isPressed, action.getClip().duration);
  mixer.update(0);
  renderOnce();
};

export const createPlaybackController = (
  button: HTMLButtonElement,
  renderOnce: () => void
): PlaybackController => {
  let playback: ClipPlayback | null = null;
  let isPressed = false;
  const startSettleLoop = createSettleLoop(() => playback, renderOnce);

  const toggle = (): void => {
    if (!playback) {
      return;
    }
    isPressed = !isPressed;
    button.setAttribute("aria-pressed", String(isPressed));

    if (prefersReducedMotion()) {
      jumpToReducedMotionEnd(playback, isPressed, renderOnce);
      return;
    }

    const { action, durationMs } = playback;
    action.paused = false;
    action.timeScale = isPressed ? 1 : -1;
    action.play();
    startSettleLoop(getSettleDeadline(performance.now(), durationMs));
  };

  return {
    setClip: (next) => {
      playback = next;
    },
    toggle,
  };
};

export const bindPointerToggle = (button: HTMLButtonElement, onToggle: () => void): void => {
  let pointerStart: { x: number; y: number } | null = null;
  button.addEventListener("pointerdown", (e) => {
    pointerStart = { x: e.clientX, y: e.clientY };
  });
  button.addEventListener("pointerup", (e) => {
    if (!pointerStart) {
      return;
    }
    const dragged = hasDragged(pointerStart, { x: e.clientX, y: e.clientY });
    pointerStart = null;
    if (!dragged) {
      onToggle();
    }
  });

  button.addEventListener("click", (e) => {
    if (e.detail === 0) {
      onToggle();
    }
  });
};
