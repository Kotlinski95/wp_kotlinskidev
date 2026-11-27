export const ACCESSIBILITY_MOTION_EVENT = "kotlinskidev-a11y:motion";
export const ACCESSIBILITY_STOP_CLASS = "ka11y-stop-animations";

interface AccessibilityMotionWindow extends Window {
  kotlinskidevA11yMotion?: { stopped?: boolean };
}

export const isAccessibilityMotionStopped = (
  targetWindow: Window = window,
  targetDocument: Document = targetWindow.document
): boolean =>
  targetDocument.documentElement.classList.contains(ACCESSIBILITY_STOP_CLASS) ||
  (targetWindow as AccessibilityMotionWindow).kotlinskidevA11yMotion?.stopped === true;

export const onAccessibilityMotionChange = (
  callback: (stopped: boolean) => void,
  targetWindow: Window = window
): (() => void) => {
  const listener = (): void => callback(isAccessibilityMotionStopped(targetWindow));
  targetWindow.addEventListener(ACCESSIBILITY_MOTION_EVENT, listener);
  return () => targetWindow.removeEventListener(ACCESSIBILITY_MOTION_EVENT, listener);
};
