import { SwiperInit, type SliderOptions } from "./swiper-init";

const init = (): void => {
  const containers = document.querySelectorAll<HTMLElement>(".wp-block-wpe-slider.swiper");

  containers.forEach((element) => {
    if (!element.dataset.swiper) {
      return;
    }

    element.style.visibility = "hidden";

    let options: SliderOptions = {};
    try {
      options = JSON.parse(element.dataset.swiper);
    } catch (error) {
      console.error(error);
      return;
    }

    SwiperInit(element, options);
    element.style.visibility = "visible";
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
