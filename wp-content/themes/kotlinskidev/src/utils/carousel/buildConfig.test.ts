import { buildSwiperConfig } from "./buildConfig";

describe("buildSwiperConfig", () => {
  it("applies documented defaults when given an empty settings object", () => {
    const config = buildSwiperConfig({});

    expect(config.loop).toBe(true);
    expect(config.slidesPerView).toBe(1);
    expect(config.navigation).toEqual({
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    });
    expect(config.pagination).toEqual({ el: ".swiper-pagination", clickable: true });
    expect(config.scrollbar).toBe(false);
    expect(config.autoplay).toBe(false);
  });

  it("maps per-breakpoint slide counts onto the swiper breakpoints object", () => {
    const config = buildSwiperConfig({
      slidesPerMobile: 1,
      slidesPerTablet: 2,
      slidesPerDesktop: 3,
    });

    expect(config.breakpoints).toEqual({
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    });
  });

  it("disables navigation when showArrows is false", () => {
    const config = buildSwiperConfig({ showArrows: false });

    expect(config.navigation).toBe(false);
  });

  it("disables both pagination and scrollbar when both are requested together", () => {
    const config = buildSwiperConfig({ showPagination: true, showScrollbar: true });

    expect(config.pagination).toBe(false);
    expect(config.scrollbar).toBe(false);
  });

  it("enables scrollbar on its own when pagination is off", () => {
    const config = buildSwiperConfig({ showPagination: false, showScrollbar: true });

    expect(config.scrollbar).toEqual({ el: ".swiper-scrollbar", draggable: true });
  });

  it("builds an autoplay config with the given delay when autoplay is enabled", () => {
    const config = buildSwiperConfig({ autoplay: true, autoplayDelay: 5000 });

    expect(config.autoplay).toEqual({ delay: 5000, disableOnInteraction: false });
  });

  it("leaves autoplay disabled when not requested, regardless of autoplayDelay", () => {
    const config = buildSwiperConfig({ autoplay: false, autoplayDelay: 5000 });

    expect(config.autoplay).toBe(false);
  });
});
