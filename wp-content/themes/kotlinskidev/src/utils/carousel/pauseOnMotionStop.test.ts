import type Swiper from "swiper";
import { pauseAutoplayOnMotionStop } from "./pauseOnMotionStop";

const STOP_CLASS = "ka11y-stop-animations";

const setStopped = (stopped: boolean): void => {
  document.documentElement.classList.toggle(STOP_CLASS, stopped);
  window.dispatchEvent(new CustomEvent("kotlinskidev-a11y:motion", { detail: { stopped } }));
};

const createSwiper = (running: boolean) => {
  const autoplay = {
    running,
    stop: jest.fn(() => {
      autoplay.running = false;
    }),
    start: jest.fn(() => {
      autoplay.running = true;
    }),
  };
  const handlers: Record<string, () => void> = {};
  const swiper = {
    destroyed: false,
    autoplay,
    on: jest.fn((name: string, handler: () => void) => {
      handlers[name] = handler;
    }),
  };
  return { swiper: swiper as unknown as Swiper, autoplay, handlers };
};

afterEach(() => {
  document.documentElement.classList.remove(STOP_CLASS);
});

it("stops a running autoplay when Stop animations turns on and restarts it when off", () => {
  const { swiper, autoplay } = createSwiper(true);
  pauseAutoplayOnMotionStop(swiper);

  setStopped(true);
  expect(autoplay.stop).toHaveBeenCalledTimes(1);

  setStopped(false);
  expect(autoplay.start).toHaveBeenCalledTimes(1);
});

it("stops immediately when already stopped at init", () => {
  document.documentElement.classList.add(STOP_CLASS);
  const { swiper, autoplay } = createSwiper(true);

  pauseAutoplayOnMotionStop(swiper);

  expect(autoplay.stop).toHaveBeenCalledTimes(1);
});

it("does not start an autoplay that was not running", () => {
  const { swiper, autoplay } = createSwiper(false);
  pauseAutoplayOnMotionStop(swiper);

  setStopped(true);
  setStopped(false);

  expect(autoplay.start).not.toHaveBeenCalled();
});

it("stops listening once the swiper is destroyed", () => {
  const { swiper, autoplay, handlers } = createSwiper(true);
  pauseAutoplayOnMotionStop(swiper);

  handlers.destroy();
  setStopped(true);

  expect(autoplay.stop).not.toHaveBeenCalled();
});
