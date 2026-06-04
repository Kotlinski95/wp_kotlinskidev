export interface CarouselSettings {
  showArrows: boolean;
  showPagination: boolean;
  showScrollbar: boolean;
  loop: boolean;
  autoplay: boolean;
  autoplayDelay: number;
  slidesPerView: number;
  slidesPerMobile: number;
  slidesPerTablet: number;
  slidesPerDesktop: number;
  lazyLoad: boolean;
  arrowsPosition: "sides" | "bottom-left" | "bottom-center" | "bottom-right";
  navColor: string;
  navColorOnHover: boolean;
  navPlacement: "inside" | "outside";
  trackActiveSlide: boolean;
}

export interface CarouselFeatures {
  slidesPerBreakpoint?: boolean;
  scrollbar?: boolean;
  autoplay?: boolean;
  lazyLoad?: boolean;
  arrowsPosition?: boolean;
  navColor?: boolean;
  navPlacement?: boolean;
  trackActiveSlide?: boolean;
}
