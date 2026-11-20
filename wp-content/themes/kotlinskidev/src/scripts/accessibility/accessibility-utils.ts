import { matchReducedMotionQuery, REDUCED_MOTION_QUERY } from "./reduced-motion-query";
import type { ReducedMotionVideoController } from "./reduced-motion-video-controller";

type MotionHandler = (matches: boolean) => void;

export interface AccessibilityUtils {
  prefersReducedMotion: () => boolean;
  checkVideos: () => void | undefined;
  addMotionSensitiveElement: (
    element: HTMLElement,
    onReduce: () => void,
    onRestore: () => void
  ) => () => void;
  createMediaQueryListener: (query: string, handler: MotionHandler) => () => void;
  composeMotionHandlers: (...handlers: MotionHandler[]) => MotionHandler;
}

declare global {
  interface Window {
    accessibilityUtils?: AccessibilityUtils;
  }
}

type VideoControllerGetter = () => ReducedMotionVideoController | undefined;

function prefersReducedMotion(): boolean {
  return matchReducedMotionQuery().matches;
}

function createMediaQueryListener(query: string, handler: MotionHandler): () => void {
  const mediaQuery = window.matchMedia(query);
  const onChange = (event: MediaQueryListEvent): void => handler(event.matches);

  handler(mediaQuery.matches);

  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

function addMotionSensitiveElement(
  _element: HTMLElement,
  onReduce: () => void,
  onRestore: () => void
): () => void {
  return createMediaQueryListener(REDUCED_MOTION_QUERY, (matches) =>
    matches ? onReduce() : onRestore()
  );
}

function composeMotionHandlers(...handlers: MotionHandler[]): MotionHandler {
  return (matches) => handlers.forEach((handler) => handler(matches));
}

export function createAccessibilityUtils(
  getVideoController: VideoControllerGetter
): AccessibilityUtils {
  return {
    prefersReducedMotion,
    checkVideos: () => getVideoController()?.checkVideos(),
    addMotionSensitiveElement,
    createMediaQueryListener,
    composeMotionHandlers,
  };
}
