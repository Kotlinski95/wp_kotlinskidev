import {
  ACCESSIBILITY_MOTION_EVENT,
  ACCESSIBILITY_STOP_CLASS,
  isAccessibilityMotionStopped,
  onAccessibilityMotionChange,
} from "./accessibility-motion";

type MotionWindow = Window & { kotlinskidevA11yMotion?: { stopped?: boolean } };

afterEach(() => {
  document.documentElement.classList.remove(ACCESSIBILITY_STOP_CLASS);
  delete (window as MotionWindow).kotlinskidevA11yMotion;
});

describe("isAccessibilityMotionStopped", () => {
  it("is false when the plugin is absent", () => {
    expect(isAccessibilityMotionStopped()).toBe(false);
  });

  it("is true when the html class is present", () => {
    document.documentElement.classList.add(ACCESSIBILITY_STOP_CLASS);
    expect(isAccessibilityMotionStopped()).toBe(true);
  });

  it("is true when the window flag says stopped", () => {
    (window as MotionWindow).kotlinskidevA11yMotion = { stopped: true };
    expect(isAccessibilityMotionStopped()).toBe(true);
  });

  it("is false when the window flag says not stopped", () => {
    (window as MotionWindow).kotlinskidevA11yMotion = { stopped: false };
    expect(isAccessibilityMotionStopped()).toBe(false);
  });
});

describe("onAccessibilityMotionChange", () => {
  it("reports the current state on every event", () => {
    const callback = jest.fn();
    onAccessibilityMotionChange(callback);

    document.documentElement.classList.add(ACCESSIBILITY_STOP_CLASS);
    window.dispatchEvent(
      new CustomEvent(ACCESSIBILITY_MOTION_EVENT, { detail: { stopped: true } })
    );
    document.documentElement.classList.remove(ACCESSIBILITY_STOP_CLASS);
    window.dispatchEvent(
      new CustomEvent(ACCESSIBILITY_MOTION_EVENT, { detail: { stopped: false } })
    );

    expect(callback.mock.calls).toEqual([[true], [false]]);
  });

  it("stops reporting after unsubscribe", () => {
    const callback = jest.fn();
    const unsubscribe = onAccessibilityMotionChange(callback);
    unsubscribe();

    window.dispatchEvent(new CustomEvent(ACCESSIBILITY_MOTION_EVENT));

    expect(callback).not.toHaveBeenCalled();
  });
});
