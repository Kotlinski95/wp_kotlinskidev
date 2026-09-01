function setScrollTop(value: number) {
  Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value });
}

function buildScrollToTopMarkup() {
  document.body.innerHTML = `
    <main></main>
    <button id="scroll-to-top"></button>
    <div class="scroll-to-top-wrapper"></div>
    <svg class="progress-ring">
      <circle></circle>
      <circle class="progress-ring__progress" data-circumference="100"></circle>
    </svg>
  `;
}

describe("scroll-to-top.ts — button visibility and progress", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    jest
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ fontSize: "16px" } as CSSStyleDeclaration);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setScrollTop(0);
  });

  it("does nothing when the required markup is missing", () => {
    document.body.innerHTML = "";

    expect(() => require("./scroll-to-top")).not.toThrow();
  });

  it("hides the button and progress ring below the scroll threshold", () => {
    buildScrollToTopMarkup();
    setScrollTop(50);

    require("./scroll-to-top");

    const button = document.getElementById("scroll-to-top") as HTMLElement;
    const wrapper = document.querySelector(".scroll-to-top-wrapper") as HTMLElement;
    expect(button.style.display).toBe("none");
    expect(wrapper.classList.contains("show")).toBe(false);
  });

  it("shows the button and updates the progress ring above the threshold", () => {
    buildScrollToTopMarkup();
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 500,
    });
    require("./scroll-to-top");
    const ring = document.querySelector(".progress-ring__progress") as SVGCircleElement;
    const circumference = Number(ring.dataset.circumference);

    setScrollTop(250);
    window.dispatchEvent(new Event("scroll"));

    const button = document.getElementById("scroll-to-top") as HTMLElement;
    const wrapper = document.querySelector(".scroll-to-top-wrapper") as HTMLElement;
    expect(button.style.display).toBe("block");
    expect(wrapper.classList.contains("show")).toBe(true);
    expect(Number(ring.style.strokeDashoffset)).toBeCloseTo(circumference * 0.5, 5);
  });

  it("updates visibility again on a throttled scroll event", () => {
    buildScrollToTopMarkup();
    setScrollTop(0);
    require("./scroll-to-top");
    const button = document.getElementById("scroll-to-top") as HTMLElement;
    expect(button.style.display).toBe("none");

    setScrollTop(150);
    window.dispatchEvent(new Event("scroll"));

    expect(button.style.display).toBe("block");
  });

  it("focuses <main> once the scroll-to-top animation settles", () => {
    buildScrollToTopMarkup();
    setScrollTop(0);
    require("./scroll-to-top");
    const button = document.getElementById("scroll-to-top") as HTMLElement;
    const main = document.querySelector("main") as HTMLElement;
    jest.spyOn(main, "focus");
    window.scrollTo = jest.fn();

    button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(main.getAttribute("tabindex")).toBe("-1");
    expect(main.focus).toHaveBeenCalled();
  });

  it("triggers scroll-to-top on Enter and Space keydown", () => {
    buildScrollToTopMarkup();
    require("./scroll-to-top");
    const button = document.getElementById("scroll-to-top") as HTMLElement;
    window.scrollTo = jest.fn();

    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    button.dispatchEvent(event);

    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("ignores other keys on keydown", () => {
    buildScrollToTopMarkup();
    require("./scroll-to-top");
    const button = document.getElementById("scroll-to-top") as HTMLElement;
    window.scrollTo = jest.fn();

    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", cancelable: true }));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("does nothing on scroll-to-top click when <main> is missing", () => {
    buildScrollToTopMarkup();
    document.querySelector("main")?.remove();
    require("./scroll-to-top");
    const button = document.getElementById("scroll-to-top") as HTMLElement;
    window.scrollTo = jest.fn();

    expect(() =>
      button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    ).not.toThrow();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

describe("scroll-to-top.ts — bar variant trigger", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setScrollTop(0);
  });

  it("scrolls to top and refocuses <main> on click, without requiring a progress ring", () => {
    document.body.innerHTML = `
      <main></main>
      <button class="kt-scroll-to-top__trigger"></button>
    `;
    require("./scroll-to-top");
    const trigger = document.querySelector(".kt-scroll-to-top__trigger") as HTMLElement;
    const main = document.querySelector("main") as HTMLElement;
    jest.spyOn(main, "focus");
    window.scrollTo = jest.fn();

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(main.getAttribute("tabindex")).toBe("-1");
    expect(main.focus).toHaveBeenCalled();
  });

  it("wires up multiple bar-variant instances independently", () => {
    document.body.innerHTML = `
      <main></main>
      <button class="kt-scroll-to-top__trigger" id="first"></button>
      <button class="kt-scroll-to-top__trigger" id="second"></button>
    `;
    require("./scroll-to-top");
    window.scrollTo = jest.fn();

    document
      .getElementById("second")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });
});

describe("scroll-to-top.ts — progress ring sizing", () => {
  beforeEach(() => {
    jest.resetModules();
    jest
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ fontSize: "16px" } as CSSStyleDeclaration);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does nothing when the progress ring markup is missing", () => {
    document.body.innerHTML = "";

    expect(() => require("./scroll-to-top")).not.toThrow();
  });

  it("sizes the ring and circles from the root font size", () => {
    buildScrollToTopMarkup();

    require("./scroll-to-top");

    const ring = document.querySelector(".progress-ring") as SVGElement;
    const circles = document.querySelectorAll("circle");

    expect(ring.getAttribute("role")).toBe("img");
    expect(ring.getAttribute("width")).toBe("40");
    circles.forEach((circle) => {
      expect(circle.getAttribute("r")).toBe("18.5");
    });
  });

  it("stores the computed circumference on the progress circle's dataset", () => {
    buildScrollToTopMarkup();

    require("./scroll-to-top");

    const progressCircle = document.querySelector(".progress-ring__progress") as SVGCircleElement;
    expect(Number(progressCircle.dataset.circumference)).toBeCloseTo(2 * Math.PI * 18.5, 3);
  });
});
