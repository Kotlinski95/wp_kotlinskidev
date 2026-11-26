import {
  applyResponsiveVideo,
  clearVideoPosterData,
  clearVideoSourceData,
  currentDevice,
  resolveVideoAlphaSource,
  resolveVideoPoster,
  resolveVideoSource,
  watchDevice,
} from "./responsive-media";

type Listener = () => void;

interface FakeQuery {
  matches: boolean;
  listeners: Listener[];
}

let queries: Record<string, FakeQuery> = {};

const setWidthMatches = (mobile: boolean, tablet: boolean) => {
  queries["(max-width: 781px)"].matches = mobile;
  queries["(max-width: 1023px)"].matches = tablet;
  Object.values(queries).forEach((query) => query.listeners.forEach((listener) => listener()));
};

const installMatchMedia = () => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => {
    queries[query] = queries[query] ?? { matches: false, listeners: [] };
    const entry = queries[query];
    return {
      get matches() {
        return entry.matches;
      },
      addEventListener: (_event: string, listener: Listener) => entry.listeners.push(listener),
    };
  }) as unknown as typeof window.matchMedia;
};

const buildVideo = (dataset: Record<string, string> = {}): HTMLVideoElement => {
  const video = document.createElement("video");
  Object.entries(dataset).forEach(([name, value]) => video.setAttribute(name, value));
  video.load = jest.fn();
  video.play = jest.fn().mockResolvedValue(undefined);
  return video;
};

beforeEach(() => {
  queries = {};
  installMatchMedia();
  window.matchMedia("(max-width: 781px)");
  window.matchMedia("(max-width: 1023px)");
});

describe("currentDevice", () => {
  it("reports desktop, tablet and mobile from the theme breakpoints", () => {
    expect(currentDevice()).toBe("desktop");

    queries["(max-width: 1023px)"].matches = true;
    expect(currentDevice()).toBe("tablet");

    queries["(max-width: 781px)"].matches = true;
    expect(currentDevice()).toBe("mobile");
  });

  it("falls back to the window width without matchMedia", () => {
    (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 400 });
    expect(currentDevice()).toBe("mobile");
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 900 });
    expect(currentDevice()).toBe("tablet");
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1600 });
    expect(currentDevice()).toBe("desktop");
  });
});

describe("watchDevice", () => {
  it("calls back with the new device when a breakpoint is crossed", () => {
    const callback = jest.fn();
    watchDevice(callback);

    setWidthMatches(true, true);

    expect(callback).toHaveBeenLastCalledWith("mobile");
  });
});

describe("resolveVideoSource and resolveVideoPoster", () => {
  it("prefers the device attribute and falls back to the plain one", () => {
    const video = buildVideo({
      "data-src": "d.mp4",
      "data-kt-src-mobile": "m.mp4",
      "data-poster": "d.jpg",
      "data-kt-poster-mobile": "m.jpg",
    });

    expect(resolveVideoSource(video, "mobile")).toBe("m.mp4");
    expect(resolveVideoSource(video, "tablet")).toBe("d.mp4");
    expect(resolveVideoPoster(video, "mobile")).toBe("m.jpg");
    expect(resolveVideoPoster(video, "desktop")).toBe("d.jpg");
  });

  it("returns undefined when nothing is set", () => {
    const video = buildVideo();

    expect(resolveVideoSource(video, "mobile")).toBeUndefined();
    expect(resolveVideoPoster(video, "mobile")).toBeUndefined();
  });
});

describe("clearVideoSourceData and clearVideoPosterData", () => {
  it("removes only the source or only the poster data attributes", () => {
    const video = buildVideo({
      "data-src": "d.mp4",
      "data-poster": "d.jpg",
      "data-kt-src-mobile": "m.mp4",
      "data-kt-poster-mobile": "m.jpg",
    });

    clearVideoPosterData(video);
    expect(Object.keys(video.dataset).sort()).toEqual(["ktSrcMobile", "src"]);

    clearVideoSourceData(video);
    expect(Object.keys(video.dataset)).toEqual([]);
  });
});

describe("applyResponsiveVideo", () => {
  it("sets the device source and poster, loads and plays", () => {
    const video = buildVideo({
      "data-kt-src-mobile": "m.mp4",
      "data-kt-poster-mobile": "m.jpg",
    });

    applyResponsiveVideo(video, "mobile");

    expect(video.getAttribute("src")).toBe("m.mp4");
    expect(video.getAttribute("poster")).toBe("m.jpg");
    expect(video.load).toHaveBeenCalled();
    expect(video.play).toHaveBeenCalled();
  });

  it("does not reload an unchanged source", () => {
    const video = buildVideo({ "data-kt-src-mobile": "m.mp4" });
    applyResponsiveVideo(video, "mobile");
    (video.load as jest.Mock).mockClear();

    applyResponsiveVideo(video, "mobile");

    expect(video.load).not.toHaveBeenCalled();
  });

  it("removes the poster for an empty device poster", () => {
    const video = buildVideo({ "data-kt-poster-mobile": "", poster: "d.jpg" });

    applyResponsiveVideo(video, "mobile");

    expect(video.hasAttribute("poster")).toBe(false);
  });

  it("does not play when autoplay is off", () => {
    const video = buildVideo({ "data-kt-src-mobile": "m.mp4", "data-kt-video-autoplay": "off" });

    applyResponsiveVideo(video, "mobile");

    expect(video.play).not.toHaveBeenCalled();
  });
});

describe("resolveVideoAlphaSource", () => {
  it("prefers the device alpha attribute and falls back to the desktop alpha source", () => {
    const video = buildVideo({
      "data-src-alpha": "d.mov",
      "data-kt-src-alpha-mobile": "m.mov",
    });

    expect(resolveVideoAlphaSource(video, "mobile")).toBe("m.mov");
    expect(resolveVideoAlphaSource(video, "tablet")).toBe("d.mov");
    expect(resolveVideoAlphaSource(buildVideo(), "mobile")).toBeUndefined();
  });

  it("clears the alpha device attributes with the source data", () => {
    const video = buildVideo({ "data-kt-src-alpha-mobile": "m.mov" });
    clearVideoSourceData(video);

    expect(video.dataset.ktSrcAlphaMobile).toBeUndefined();
  });
});
