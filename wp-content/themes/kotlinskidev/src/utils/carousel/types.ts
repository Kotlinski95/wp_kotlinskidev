export interface CarouselSettings {
  showArrows: boolean;
  showPagination: boolean;
  showScrollbar: boolean;
  loop: boolean;
  draggable: boolean;
  autoplay: boolean;
  autoplayDelay: number;
  slidesPerView: number | "auto";
  slidesPerMobile: number | "auto";
  slidesPerTablet: number | "auto";
  slidesPerDesktop: number | "auto";
  lazyLoad: boolean;
  arrowsPosition: "sides" | "bottom-left" | "bottom-center" | "bottom-right";
  navColor: string;
  navColorOnHover: boolean;
  navPlacement: "inside" | "outside";
  trackActiveSlide: boolean;
  paginationPlacement: "inside" | "outside";
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
  paginationPlacement?: boolean;
}
