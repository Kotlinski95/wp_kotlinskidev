import { initResponsiveMedia } from "./responsive-media";

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

beforeEach(() => {
  document.body.innerHTML = "";
  queries = {};

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
});

const mountVideo = (extra: Record<string, string> = {}): HTMLVideoElement => {
  const video = document.createElement("video");
  const attributes: Record<string, string> = {
    "data-kt-src-desktop": "desktop.mp4",
    "data-kt-src-tablet": "tablet.mp4",
    "data-kt-src-mobile": "mobile.mp4",
    "data-kt-bp-mobile": "781",
    "data-kt-bp-tablet": "1023",
    ...extra,
  };
  Object.entries(attributes).forEach(([name, value]) => video.setAttribute(name, value));
  video.load = jest.fn();
  video.play = jest.fn().mockResolvedValue(undefined);
  document.body.appendChild(video);
  return video;
};

describe("initResponsiveMedia", () => {
  it("uses the desktop source on a wide viewport", () => {
    const video = mountVideo();

    initResponsiveMedia();

    expect(video.getAttribute("src")).toBe("desktop.mp4");
  });

  it("uses the mobile source on a narrow viewport and plays it", () => {
    const video = mountVideo();
    window.matchMedia("(max-width: 781px)");
    queries["(max-width: 781px)"].matches = true;

    initResponsiveMedia();

    expect(video.getAttribute("src")).toBe("mobile.mp4");
    expect(video.play).toHaveBeenCalled();
  });

  it("uses the tablet source between the two breakpoints", () => {
    const video = mountVideo();
    window.matchMedia("(max-width: 1023px)");
    queries["(max-width: 1023px)"].matches = true;

    initResponsiveMedia();

    expect(video.getAttribute("src")).toBe("tablet.mp4");
  });

  it("swaps the source when the viewport crosses a breakpoint", () => {
    const video = mountVideo();
    initResponsiveMedia();

    setWidthMatches(true, true);

    expect(video.getAttribute("src")).toBe("mobile.mp4");
    expect(video.load).toHaveBeenCalled();
  });

  it("does not reload when the resolved source is unchanged", () => {
    const video = mountVideo({ "data-kt-src-tablet": "desktop.mp4" });
    initResponsiveMedia();
    (video.load as jest.Mock).mockClear();

    setWidthMatches(false, true);

    expect(video.load).not.toHaveBeenCalled();
  });

  it("does not play after a swap when autoplay is off", () => {
    const video = mountVideo({ "data-kt-video-autoplay": "off" });
    initResponsiveMedia();

    setWidthMatches(true, true);

    expect(video.play).not.toHaveBeenCalled();
  });

  it("skips videos without breakpoint data", () => {
    const video = mountVideo({ "data-kt-bp-mobile": "" });

    initResponsiveMedia();

    expect(video.hasAttribute("src")).toBe(false);
  });

  it("switches the poster with the device", () => {
    const video = mountVideo({
      "data-kt-poster-desktop": "desktop.jpg",
      "data-kt-poster-tablet": "tablet.jpg",
      "data-kt-poster-mobile": "mobile.jpg",
    });
    initResponsiveMedia();
    expect(video.getAttribute("poster")).toBe("desktop.jpg");

    setWidthMatches(true, true);

    expect(video.getAttribute("poster")).toBe("mobile.jpg");
  });

  it("removes the poster when the device poster is empty", () => {
    const video = mountVideo({
      "data-kt-poster-desktop": "desktop.jpg",
      "data-kt-poster-mobile": "",
      poster: "desktop.jpg",
    });
    initResponsiveMedia();

    setWidthMatches(true, true);

    expect(video.hasAttribute("poster")).toBe(false);
  });

  it("leaves the poster alone when no poster data exists", () => {
    const video = mountVideo({ poster: "native.jpg" });

    initResponsiveMedia();
    setWidthMatches(true, true);

    expect(video.getAttribute("poster")).toBe("native.jpg");
  });
});
