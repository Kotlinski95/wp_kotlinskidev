const mockSlideChangeHandlers: Array<() => void> = [];

class MockSwiper {
  realIndex = 0;
  params: Record<string, unknown>;
  el: HTMLElement;

  constructor(el: HTMLElement, params: Record<string, unknown>) {
    this.el = el;
    this.params = params;
  }

  on(event: string, handler: () => void) {
    if (event === "slideChange") {
      mockSlideChangeHandlers.push(handler);
    }
  }
}

jest.mock("swiper", () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (el: HTMLElement, params: Record<string, unknown>) => new MockSwiper(el, params)
    ),
}));

jest.mock("swiper/modules", () => ({
  Navigation: "Navigation",
  Pagination: "Pagination",
  Keyboard: "Keyboard",
  Autoplay: "Autoplay",
  Scrollbar: "Scrollbar",
}));

function buildCarousel(settings: Record<string, unknown> | string, slideCount = 3) {
  document.body.innerHTML = "";
  const el = document.createElement("div");
  el.setAttribute(
    "data-carousel-settings",
    typeof settings === "string" ? settings : JSON.stringify(settings)
  );
  for (let i = 0; i < slideCount; i += 1) {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    el.append(slide);
  }
  document.body.append(el);
  return el;
}

function loadModule() {
  jest.resetModules();
  mockSlideChangeHandlers.length = 0;
  require("./init");
}

describe("banner-carousel/init.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when there are no carousel elements", () => {
    document.body.innerHTML = "";

    expect(() => loadModule()).not.toThrow();
  });

  it("initializes a Swiper instance with the parsed settings applied", () => {
    const el = buildCarousel({ showArrows: true });

    loadModule();

    const swiperCalls = (jest.requireMock("swiper") as { default: jest.Mock }).default.mock.results;
    expect(swiperCalls).toHaveLength(1);
    const instance = swiperCalls[0].value as MockSwiper;
    expect(instance.el).toBe(el);
    expect(instance.params.modules).toEqual([
      "Navigation",
      "Pagination",
      "Keyboard",
      "Autoplay",
      "Scrollbar",
    ]);
  });

  it("falls back to default settings when the JSON is invalid", () => {
    buildCarousel("{not-json");

    expect(() => loadModule()).not.toThrow();
  });

  it("wires prev/next buttons found inside a sibling .carousel-nav container", () => {
    const wrapper = document.createElement("div");
    document.body.innerHTML = "";
    const el = document.createElement("div");
    el.setAttribute("data-carousel-settings", JSON.stringify({ showArrows: true }));
    const nav = document.createElement("div");
    nav.className = "carousel-nav";
    nav.innerHTML =
      '<button class="swiper-button-prev"></button><button class="swiper-button-next"></button>';
    wrapper.append(el, nav);
    document.body.append(wrapper);

    loadModule();

    const instance = (jest.requireMock("swiper") as { default: jest.Mock }).default.mock.results[0]
      .value as MockSwiper;
    const navigation = instance.params.navigation as { prevEl: HTMLElement; nextEl: HTMLElement };
    expect(navigation.prevEl).toBe(nav.querySelector(".swiper-button-prev"));
    expect(navigation.nextEl).toBe(nav.querySelector(".swiper-button-next"));
  });

  it("makes the carousel visible again after initialization", () => {
    const el = buildCarousel({});

    loadModule();

    expect(el.style.visibility).toBe("visible");
  });

  it("populates and updates the slide counter, excluding duplicate slides", () => {
    const wrapper = document.createElement("div");
    document.body.innerHTML = "";
    const el = document.createElement("div");
    el.setAttribute("data-carousel-settings", JSON.stringify({}));
    for (let i = 0; i < 3; i += 1) {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      el.append(slide);
    }
    const dup = document.createElement("div");
    dup.className = "swiper-slide swiper-slide-duplicate";
    el.append(dup);
    const nav = document.createElement("div");
    nav.className = "carousel-nav";
    nav.innerHTML = '<span class="carousel-nav__counter"></span>';
    wrapper.append(el, nav);
    document.body.append(wrapper);

    loadModule();

    const counter = nav.querySelector(".carousel-nav__counter") as HTMLElement;
    expect(counter.querySelector(".carousel-nav__current")?.textContent).toBe("01");
    expect(counter.textContent).toBe("01 / 03");

    const instance = (jest.requireMock("swiper") as { default: jest.Mock }).default.mock.results[0]
      .value as MockSwiper;
    instance.realIndex = 2;
    mockSlideChangeHandlers.forEach((handler) => handler());

    expect(counter.querySelector(".carousel-nav__current")?.textContent).toBe("03");
  });

  it("initializes every carousel found on the page", () => {
    document.body.innerHTML = "";
    const first = document.createElement("div");
    first.setAttribute("data-carousel-settings", "{}");
    const second = document.createElement("div");
    second.setAttribute("data-carousel-settings", "{}");
    document.body.append(first, second);

    loadModule();

    const swiperMock = (jest.requireMock("swiper") as { default: jest.Mock }).default;
    expect(swiperMock).toHaveBeenCalledTimes(2);
  });
});
