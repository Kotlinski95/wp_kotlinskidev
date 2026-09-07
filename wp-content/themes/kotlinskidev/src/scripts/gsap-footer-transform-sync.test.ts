const tickerCallbacks: Array<() => void> = [];

jest.mock("gsap", () => ({
  gsap: {
    registerPlugin: jest.fn(),
    ticker: {
      add: jest.fn((cb: () => void) => tickerCallbacks.push(cb)),
    },
  },
}));

jest.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

function loadModule() {
  jest.resetModules();
  tickerCallbacks.length = 0;
  jest.isolateModules(() => {
    require("./gsap-footer-transform-sync");
  });
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

function tick() {
  tickerCallbacks.forEach((cb) => cb());
}

describe("gsap-footer-transform-sync.ts", () => {
  it("does nothing when there is no .main-wrapper", () => {
    document.body.innerHTML =
      '<div class="scroll-section"></div><footer><div class="kotlinskidev-footer"></div></footer>';

    expect(() => loadModule()).not.toThrow();
    expect(tickerCallbacks).toHaveLength(0);
  });

  it("does nothing when there is no .kotlinskidev-footer", () => {
    document.body.innerHTML =
      '<div class="main-wrapper"></div><div class="scroll-section"></div><footer></footer>';

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("does nothing when there is no .scroll-section", () => {
    document.body.innerHTML =
      '<div class="main-wrapper"></div><footer><div class="kotlinskidev-footer"></div></footer>';

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("mirrors .main-wrapper's transform onto .kotlinskidev-footer whenever it changes, never onto <footer> itself", () => {
    document.body.innerHTML =
      '<div class="main-wrapper"></div><div class="scroll-section"></div><footer><div class="kotlinskidev-footer"></div></footer>';
    loadModule();

    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    const footer = document.querySelector<HTMLElement>("footer")!;
    const footerContent = document.querySelector<HTMLElement>(".kotlinskidev-footer")!;

    pageWrapper.style.transform = "translate(0px, 576px)";
    tick();

    expect(footerContent.style.transform).toBe("translate(0px, 576px)");
    expect(footer.style.transform).toBe("");

    pageWrapper.style.transform = "";
    tick();

    expect(footerContent.style.transform).toBe("");
  });
});
