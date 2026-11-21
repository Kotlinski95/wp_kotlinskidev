export interface SliderOptions {
  autoplay?: boolean;
  autoplayTime?: number;
  smoothTransition?: boolean;
  continuousAutoplay?: boolean;
  direction?: "normal" | "reverse";
  navigation?: boolean;
  pagination?: boolean;
  showProgress?: boolean;
  slidesPerView?: number | "auto";
  slidesPerMobile?: number | "auto";
  slidesPerTablet?: number | "auto";
  slidesPerDesktop?: number | "auto";
  scrollbar?: boolean;
  loop?: boolean;
  mousewheel?: boolean;
  keyboard?: boolean;
  spaceBetween?: number;
  spaceBetweenMobile?: number;
  spaceBetweenTablet?: number;
  grabCursor?: boolean;
  simulateTouch?: boolean;
  centerSlides?: boolean;
  draggable?: boolean;
}
