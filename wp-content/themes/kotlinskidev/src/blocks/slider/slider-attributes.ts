export interface SliderAttributes {
  autoplay: boolean;
  autoplayTime: number;
  smoothTransition: boolean;
  continuousAutoplay: boolean;
  navigation: boolean;
  pagination: boolean;
  showProgress: boolean;
  slidesPerView: number | "auto";
  slidesPerMobile: number | "auto";
  slidesPerTablet: number | "auto";
  slidesPerDesktop: number | "auto";
  scrollbar: boolean;
  loop: boolean;
  draggable: boolean;
  mousewheel: boolean;
  keyboard: boolean;
  spaceBetween: number;
  spaceBetweenMobile?: number;
  spaceBetweenTablet?: number;
  centerSlides: boolean;
  peek: number;
  slideMaxWidth: string | number;
  blurOtherSlides: boolean;
  blurAmount: string;
  paginationPlacement: "inside" | "outside";
  paginationStyle?: "dots" | "pill";
  equalSlideHeight?: boolean;
  highlightActiveSlide?: boolean;
  activeHighlightColor?: string;
  activeHighlightStrength?: number;
}

export interface SliderSettingsProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
}
