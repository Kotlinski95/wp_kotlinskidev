import type Swiper from "swiper";
import { isAccessibilityMotionStopped, onAccessibilityMotionChange } from "../accessibility-motion";

export const pauseAutoplayOnMotionStop = (swiper: Swiper): void => {
  let wasRunning = false;

  const apply = (stopped: boolean): void => {
    if (swiper.destroyed || !swiper.autoplay) {
      return;
    }
    if (stopped) {
      wasRunning = swiper.autoplay.running || wasRunning;
      swiper.autoplay.stop();
    } else if (wasRunning) {
      wasRunning = false;
      swiper.autoplay.start();
    }
  };

  if (isAccessibilityMotionStopped()) {
    apply(true);
  }
  const unsubscribe = onAccessibilityMotionChange(apply);
  swiper.on("destroy", unsubscribe);
};
