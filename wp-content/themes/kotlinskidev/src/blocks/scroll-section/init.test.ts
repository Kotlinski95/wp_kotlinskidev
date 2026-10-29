interface GsapToCall {
  target: HTMLElement;
  config: {
    x: () => number;
    ease: string;
    scrollTrigger: {
      trigger: HTMLElement;
      start: string;
      end: () => string;
      pin: HTMLElement;
      scrub: boolean;
      invalidateOnRefresh: boolean;
      markers?: boolean;
    };
  };
}

let mockToCalls: GsapToCall[] = [];
const mockRegisterPlugin = jest.fn();
const mockScrollTriggerConfig = jest.fn();

jest.mock("gsap", () => ({
  gsap: {
    registerPlugin: (...args: unknown[]) => mockRegisterPlugin(...args),
    to: (target: HTMLElement, config: unknown) => {
      mockToCalls.push({ target, config } as GsapToCall);
    },
    utils: {
      toArray: (selector: string) =>
        Array.from(globalThis.document.querySelectorAll<HTMLElement>(selector)),
    },
  },
}));

jest.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { config: (...args: unknown[]) => mockScrollTriggerConfig(...args) },
}));

function buildSection({
  itemCount = 2,
  trigger,
  markers,
}: {
  itemCount?: number;
  trigger?: string;
  markers?: string;
} = {}) {
  document.body.innerHTML = "";
  const section = document.createElement("div");
  section.setAttribute("data-scroll-section", "");
  if (trigger) {
    section.setAttribute("data-trigger", trigger);
  }
  if (markers) {
    section.setAttribute("data-markers", markers);
  }
  const track = document.createElement("div");
  track.className = "scroll-section__track";
  for (let i = 0; i < itemCount; i += 1) {
    const item = document.createElement("div");
    item.className = "scroll-section__item";
    track.append(item);
  }
  section.append(track);
  document.body.append(section);
  return { section, track };
}

function loadModule() {
  jest.resetModules();
  mockToCalls = [];
  require("./init");
}

describe("scroll-section/init.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("registers ScrollTrigger and disables mobile-resize invalidation", () => {
    buildSection();

    loadModule();

    expect(mockRegisterPlugin).toHaveBeenCalled();
    expect(mockScrollTriggerConfig).toHaveBeenCalledWith({ ignoreMobileResize: true });
  });

  it("does nothing for a track with no items", () => {
    document.body.innerHTML = "";
    const section = document.createElement("div");
    section.setAttribute("data-scroll-section", "");
    const track = document.createElement("div");
    track.className = "scroll-section__track";
    section.append(track);
    document.body.append(section);

    loadModule();

    expect(mockToCalls).toHaveLength(0);
  });

  it("pins the section itself, trigger included, with no legacy pinnedContainer/pinSpacing options", () => {
    const { section, track } = buildSection();

    loadModule();

    expect(mockToCalls).toHaveLength(1);
    const [call] = mockToCalls;
    expect(call.target).toBe(track);
    expect(call.config.ease).toBe("none");
    expect(call.config.scrollTrigger.trigger).toBe(section);
    expect(call.config.scrollTrigger.pin).toBe(section);
    expect(call.config.scrollTrigger.scrub).toBe(true);
    expect(call.config.scrollTrigger.invalidateOnRefresh).toBe(true);
    expect("pinnedContainer" in call.config.scrollTrigger).toBe(false);
    expect("pinSpacing" in call.config.scrollTrigger).toBe(false);
    expect("pinType" in call.config.scrollTrigger).toBe(false);
  });

  it("pins the nearest .scroll-section-pin-boundary ancestor instead of the bare section when one wraps it, keeping the trigger on the section itself", () => {
    const { section } = buildSection();
    const boundary = document.createElement("div");
    boundary.className = "scroll-section-pin-boundary";
    section.replaceWith(boundary);
    boundary.append(section);

    loadModule();

    expect(mockToCalls).toHaveLength(1);
    const [call] = mockToCalls;
    expect(call.config.scrollTrigger.trigger).toBe(section);
    expect(call.config.scrollTrigger.pin).toBe(boundary);
  });

  it("defaults the trigger start point to center", () => {
    buildSection();

    loadModule();

    expect(mockToCalls[0].config.scrollTrigger.start).toBe("center center");
  });

  it("uses a custom trigger point from data-trigger", () => {
    buildSection({ trigger: "top" });

    loadModule();

    expect(mockToCalls[0].config.scrollTrigger.start).toBe("top top");
  });

  it("anchors the bottom trigger point to the bottom of both track and viewport", () => {
    buildSection({ trigger: "bottom" });

    loadModule();

    expect(mockToCalls[0].config.scrollTrigger.start).toBe("bottom bottom");
  });

  it("enables markers only when data-markers is exactly the string true", () => {
    buildSection({ markers: "true" });
    loadModule();
    expect(mockToCalls[0].config.scrollTrigger.markers).toBe(true);

    buildSection({ markers: "false" });
    loadModule();
    expect(mockToCalls[0].config.scrollTrigger.markers).toBe(false);
  });

  it("computes the pan distance as scrollWidth minus clientWidth, floored at 0", () => {
    const { track } = buildSection();
    Object.defineProperty(track, "scrollWidth", { configurable: true, value: 2000 });
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 800 });

    loadModule();

    expect(mockToCalls[0].config.x()).toBe(-1200);
    expect(mockToCalls[0].config.scrollTrigger.end()).toBe("+=1200");
  });

  it("never returns a negative distance when the track does not overflow", () => {
    const { track } = buildSection();
    Object.defineProperty(track, "scrollWidth", { configurable: true, value: 400 });
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 800 });

    loadModule();

    expect(mockToCalls[0].config.x()).toBe(-0);
    expect(mockToCalls[0].config.scrollTrigger.end()).toBe("+=0");
  });

  it("animates every track when a page has more than one scroll section", () => {
    document.body.innerHTML = "";
    for (let i = 0; i < 2; i += 1) {
      const section = document.createElement("div");
      section.setAttribute("data-scroll-section", "");
      const track = document.createElement("div");
      track.className = "scroll-section__track";
      const item = document.createElement("div");
      item.className = "scroll-section__item";
      track.append(item);
      section.append(track);
      document.body.append(section);
    }

    loadModule();

    expect(mockToCalls).toHaveLength(2);
  });
});
