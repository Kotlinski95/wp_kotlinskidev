interface GsapSetCall {
  target: HTMLElement;
  vars: { yPercent: number };
}

const tickerCallbacks: Array<() => void> = [];
let mockSetCalls: GsapSetCall[] = [];
let matchMediaResults: Record<string, boolean> = {};

jest.mock("gsap", () => ({
  gsap: {
    ticker: {
      add: jest.fn((cb: () => void) => tickerCallbacks.push(cb)),
    },
    set: (target: HTMLElement, vars: unknown) => {
      mockSetCalls.push({ target, vars } as GsapSetCall);
    },
    utils: {
      toArray: (selector: string) =>
        Array.from(globalThis.document.querySelectorAll<HTMLElement>(selector)),
    },
  },
}));

function mockMatchMedia(): void {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: matchMediaResults[query] ?? false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function buildCover(
  withImage = true,
  intensity?: string
): { cover: HTMLElement; image: HTMLElement | null } {
  const section = document.createElement("div");
  section.className = "scroll-section";
  document.body.append(section);

  const cover = document.createElement("div");
  cover.className = "wp-block-cover enable-parallax";
  if (intensity !== undefined) {
    cover.dataset.parallaxIntensity = intensity;
  }
  let image: HTMLElement | null = null;
  if (withImage) {
    image = document.createElement("img");
    image.className = "wp-block-cover__image-background";
    cover.append(image);
  }
  document.body.append(cover);

  return { cover, image };
}

function mockCoverRect(cover: HTMLElement, top: number, height: number): void {
  cover.getBoundingClientRect = jest.fn().mockReturnValue({
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
}

let scrollListeners: Array<() => void> = [];
const originalWindowAddEventListener = window.addEventListener.bind(window);

function loadModule(): void {
  jest.resetModules();
  tickerCallbacks.length = 0;
  mockSetCalls = [];
  scrollListeners = [];
  jest.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
    if (type === "scroll") {
      scrollListeners.push(listener as () => void);
    }
    return originalWindowAddEventListener(type, listener as EventListener, options);
  });
  jest.isolateModules(() => {
    require("./gsap-parallax-fallback");
  });
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

function tick(): void {
  tickerCallbacks.forEach((cb) => cb());
}

describe("gsap-parallax-fallback.ts", () => {
  beforeEach(() => {
    matchMediaResults = {};
    mockMatchMedia();
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  it("does nothing when there is no .scroll-section on the page", () => {
    buildCover();
    document.querySelector(".scroll-section")!.remove();

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("does nothing when reduced motion is preferred", () => {
    matchMediaResults["(prefers-reduced-motion: reduce)"] = true;
    buildCover();

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("does nothing on touch devices", () => {
    matchMediaResults["(hover: none)"] = true;
    buildCover();

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("does nothing for a parallax cover with no image-background layer", () => {
    buildCover(false);

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("registers a per-frame ticker callback for each cover's image-background layer", () => {
    buildCover();
    loadModule();

    expect(tickerCallbacks).toHaveLength(1);
  });

  it("computes yPercent from the cover's live bounding rect, not a cached trigger position", () => {
    const { cover, image } = buildCover();
    loadModule();

    // Cover's top is exactly at the viewport bottom (800px) -> just entering -> progress 0.
    mockCoverRect(cover, 800, 400);
    tick();
    expect(mockSetCalls.at(-1)!.target).toBe(image);
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(-15, 5);

    // Cover's top at viewport top (0) with height 400, total travel 800+400=1200,
    // progress = (800-0)/1200 = 0.667 -> yPercent = -15 + 0.667*30 = 5.
    mockCoverRect(cover, 0, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(5, 1);

    // Cover's bottom exactly at viewport top -> fully scrolled past -> progress 1 -> yPercent 15.
    mockCoverRect(cover, -400, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(15, 5);
  });

  it("clamps progress to [0, 1] even if the rect briefly reports an out-of-range position", () => {
    const { cover } = buildCover();
    loadModule();

    mockCoverRect(cover, 5000, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(-15, 5);

    mockCoverRect(cover, -5000, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(15, 5);
  });

  it("also registers a passive window scroll listener that updates the same way as the ticker", () => {
    const { cover } = buildCover();
    loadModule();

    expect(scrollListeners).toHaveLength(1);

    // top=400, height=400, innerHeight=800 -> totalTravel=1200, progress=(800-400)/1200=0.333
    // -> yPercent = -15 + 0.333*30 = -5.
    mockCoverRect(cover, 400, 400);
    scrollListeners[0]();

    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(-5, 1);
  });

  it("updates immediately on init, without waiting for the first tick or scroll", () => {
    buildCover();

    loadModule();

    expect(mockSetCalls.length).toBeGreaterThan(0);
  });

  it("reads a custom data-parallax-intensity from the cover instead of the default", () => {
    const { cover } = buildCover(true, "5");
    loadModule();

    // top=800 (rest) -> yPercent = -intensity = -5.
    mockCoverRect(cover, 800, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(-5, 5);

    // fully scrolled past -> yPercent = +intensity = 5.
    mockCoverRect(cover, -400, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(5, 5);
  });

  it("clamps a data-parallax-intensity above 30 down to 30", () => {
    const { cover } = buildCover(true, "999");
    loadModule();

    mockCoverRect(cover, 800, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(-30, 5);
  });

  it("clamps a negative data-parallax-intensity up to 0", () => {
    const { cover } = buildCover(true, "-5");
    loadModule();

    mockCoverRect(cover, 800, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(0, 5);
  });

  it("falls back to the default intensity (15) when data-parallax-intensity is not a number", () => {
    const { cover } = buildCover(true, "not-a-number");
    loadModule();

    mockCoverRect(cover, 800, 400);
    tick();
    expect(mockSetCalls.at(-1)!.vars.yPercent).toBeCloseTo(-15, 5);
  });

  it("tracks every parallax cover on the page independently", () => {
    buildCover();
    buildCover();

    loadModule();

    expect(tickerCallbacks).toHaveLength(2);
  });
});
