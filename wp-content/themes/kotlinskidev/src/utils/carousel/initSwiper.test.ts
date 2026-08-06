import { initSwiper } from "./initSwiper";

const slideChangeHandlers: Array<() => void> = [];

class MockSwiper {
  realIndex = 0;
  params: Record<string, unknown>;

  constructor(_el: HTMLElement, params: Record<string, unknown>) {
    this.params = params;
  }

  on(event: string, handler: () => void) {
    if (event === "slideChange") {
      slideChangeHandlers.push(handler);
    }
  }
}

jest.mock("swiper", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((el: HTMLElement, params: Record<string, unknown>) => {
    return new MockSwiper(el, params);
  }),
}));

jest.mock("swiper/modules", () => ({
  Navigation: "Navigation",
  Pagination: "Pagination",
  Keyboard: "Keyboard",
  Autoplay: "Autoplay",
}));

function buildCarousel(slideCount: number) {
  const el = document.createElement("div");
  for (let i = 0; i < slideCount; i += 1) {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    el.append(slide);
  }
  return el;
}

describe("initSwiper", () => {
  beforeEach(() => {
    slideChangeHandlers.length = 0;
  });

  it("passes the built config and navigation/pagination modules to Swiper", () => {
    const el = buildCarousel(3);

    const swiper = initSwiper(el, { showArrows: true }) as unknown as MockSwiper;

    expect(swiper.params.modules).toEqual(["Navigation", "Pagination", "Keyboard", "Autoplay"]);
  });

  it("wires prev/next elements found inside a sibling .carousel-nav container", () => {
    const wrapper = document.createElement("div");
    const el = buildCarousel(3);
    const nav = document.createElement("div");
    nav.className = "carousel-nav";
    nav.innerHTML =
      '<button class="swiper-button-prev"></button><button class="swiper-button-next"></button>';
    wrapper.append(el, nav);

    const swiper = initSwiper(el, { showArrows: true }) as unknown as MockSwiper;

    const navigation = swiper.params.navigation as { prevEl: HTMLElement; nextEl: HTMLElement };
    expect(navigation.prevEl).toBe(nav.querySelector(".swiper-button-prev"));
    expect(navigation.nextEl).toBe(nav.querySelector(".swiper-button-next"));
  });

  it("falls back to prev/next elements inside the carousel itself", () => {
    const el = buildCarousel(3);
    el.insertAdjacentHTML(
      "beforeend",
      '<button class="swiper-button-prev"></button><button class="swiper-button-next"></button>'
    );

    const swiper = initSwiper(el, { showArrows: true }) as unknown as MockSwiper;

    const navigation = swiper.params.navigation as { prevEl: HTMLElement; nextEl: HTMLElement };
    expect(navigation.prevEl).toBe(el.querySelector(".swiper-button-prev"));
    expect(navigation.nextEl).toBe(el.querySelector(".swiper-button-next"));
  });

  it("disables the prev/next buttons when there is one slide or fewer", () => {
    const el = buildCarousel(1);
    el.insertAdjacentHTML(
      "beforeend",
      '<button class="swiper-button-prev"></button><button class="swiper-button-next"></button>'
    );

    initSwiper(el, { showArrows: true });

    expect(el.querySelector(".swiper-button-prev")?.hasAttribute("disabled")).toBe(true);
    expect(el.querySelector(".swiper-button-next")?.hasAttribute("disabled")).toBe(true);
  });

  it("does not disable the prev/next buttons when there is more than one slide", () => {
    const el = buildCarousel(3);
    el.insertAdjacentHTML(
      "beforeend",
      '<button class="swiper-button-prev"></button><button class="swiper-button-next"></button>'
    );

    initSwiper(el, { showArrows: true });

    expect(el.querySelector(".swiper-button-prev")?.hasAttribute("disabled")).toBe(false);
  });

  it("excludes duplicate slides from the counted slide total", () => {
    const el = buildCarousel(1);
    el.insertAdjacentHTML("beforeend", '<div class="swiper-slide swiper-slide-duplicate"></div>');
    el.insertAdjacentHTML(
      "beforeend",
      '<button class="swiper-button-prev"></button><button class="swiper-button-next"></button>'
    );

    initSwiper(el, { showArrows: true });

    expect(el.querySelector(".swiper-button-prev")?.hasAttribute("disabled")).toBe(true);
  });

  it("uses an explicit slideCount override instead of counting DOM slides", () => {
    const el = buildCarousel(5);
    el.insertAdjacentHTML(
      "beforeend",
      '<button class="swiper-button-prev"></button><button class="swiper-button-next"></button>'
    );

    initSwiper(el, { showArrows: true }, { slideCount: 1 });

    expect(el.querySelector(".swiper-button-prev")?.hasAttribute("disabled")).toBe(true);
  });

  it("populates the counter element with the current index and zero-padded total", () => {
    const wrapper = document.createElement("div");
    const el = buildCarousel(12);
    const nav = document.createElement("div");
    nav.className = "carousel-nav";
    nav.innerHTML = '<span class="carousel-nav__counter"></span>';
    wrapper.append(el, nav);

    initSwiper(el, {});

    const counter = nav.querySelector(".carousel-nav__counter") as HTMLElement;
    expect(counter.querySelector(".carousel-nav__current")?.textContent).toBe("01");
    expect(counter.textContent).toBe("01 / 12");
  });

  it("updates the counter and calls onSlideChange when the slide changes", () => {
    const wrapper = document.createElement("div");
    const el = buildCarousel(3);
    const nav = document.createElement("div");
    nav.className = "carousel-nav";
    nav.innerHTML = '<span class="carousel-nav__counter"></span>';
    wrapper.append(el, nav);
    const onSlideChange = jest.fn();

    const swiper = initSwiper(el, {}, { onSlideChange }) as unknown as MockSwiper;
    swiper.realIndex = 2;
    slideChangeHandlers.forEach((handler) => handler());

    const counter = nav.querySelector(".carousel-nav__counter") as HTMLElement;
    expect(counter.querySelector(".carousel-nav__current")?.textContent).toBe("03");
    expect(onSlideChange).toHaveBeenCalledWith(2);
  });

  it("calls onSlideChange even without a counter element in the DOM", () => {
    const el = buildCarousel(3);
    const onSlideChange = jest.fn();

    initSwiper(el, {}, { onSlideChange });
    slideChangeHandlers.forEach((handler) => handler());

    expect(onSlideChange).toHaveBeenCalledWith(0);
  });

  it("applies initialSlide and forceLoop overrides on top of the built config", () => {
    const el = buildCarousel(3);

    const swiper = initSwiper(
      el,
      {},
      { initialSlide: 2, forceLoop: true }
    ) as unknown as MockSwiper;

    expect(swiper.params.initialSlide).toBe(2);
    expect(swiper.params.loop).toBe(true);
  });
});
