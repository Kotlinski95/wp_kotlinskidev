jest.mock("./swiper-init", () => ({
  SwiperInit: jest.fn(),
}));

function buildSlider(dataSwiper?: string) {
  document.body.innerHTML = "";
  const el = document.createElement("div");
  el.className = "wp-block-wpe-slider swiper";
  if (dataSwiper !== undefined) {
    el.setAttribute("data-swiper", dataSwiper);
  }
  document.body.append(el);
  return el;
}

function loadModule() {
  jest.resetModules();
  require("./init");
  return (jest.requireMock("./swiper-init") as { SwiperInit: jest.Mock }).SwiperInit;
}

describe("slider/init.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when there are no slider elements", () => {
    document.body.innerHTML = "";

    let swiperInit: jest.Mock = jest.fn();
    expect(() => (swiperInit = loadModule())).not.toThrow();
    expect(swiperInit).not.toHaveBeenCalled();
  });

  it("skips elements with no data-swiper attribute", () => {
    buildSlider();

    const swiperInit = loadModule();

    expect(swiperInit).not.toHaveBeenCalled();
  });

  it("initializes the slider with the parsed options", () => {
    const el = buildSlider(JSON.stringify({ autoplay: true }));

    const swiperInit = loadModule();

    expect(swiperInit).toHaveBeenCalledWith(el, { autoplay: true });
  });

  it("makes the slider visible again after initialization", () => {
    const el = buildSlider(JSON.stringify({}));

    loadModule();

    expect(el.style.visibility).toBe("visible");
  });

  it("logs an error and skips initialization when the settings JSON is invalid", () => {
    const el = buildSlider("{not-json");
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const swiperInit = loadModule();

    expect(errorSpy).toHaveBeenCalled();
    expect(swiperInit).not.toHaveBeenCalled();
    expect(el.style.visibility).toBe("hidden");
    errorSpy.mockRestore();
  });

  it("initializes every matching slider on the page", () => {
    document.body.innerHTML = "";
    const first = document.createElement("div");
    first.className = "wp-block-wpe-slider swiper";
    first.setAttribute("data-swiper", "{}");
    const second = document.createElement("div");
    second.className = "wp-block-wpe-slider swiper";
    second.setAttribute("data-swiper", "{}");
    document.body.append(first, second);

    const swiperInit = loadModule();

    expect(swiperInit).toHaveBeenCalledTimes(2);
  });
});
