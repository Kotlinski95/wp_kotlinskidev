interface AccessibilityUtils {
  prefersReducedMotion: () => boolean;
  checkVideos: () => void;
  addMotionSensitiveElement: (
    el: HTMLElement,
    onReduce: () => void,
    onRestore: () => void
  ) => () => void;
  createMediaQueryListener: (query: string, handler: (matches: boolean) => void) => () => void;
  composeMotionHandlers: (
    ...handlers: Array<(matches: boolean) => void>
  ) => (matches: boolean) => void;
}

interface VideoController {
  init: () => void;
  checkVideos: () => void;
}

const mediaQueryListeners: Record<string, Array<(e: { matches: boolean }) => void>> = {};
const mediaQueryState: Record<string, boolean> = {};

function setMatches(query: string, matches: boolean) {
  mediaQueryState[query] = matches;
}

function mockMatchMedia(matches: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => {
    mediaQueryListeners[query] = mediaQueryListeners[query] ?? [];
    if (!(query in mediaQueryState)) {
      mediaQueryState[query] = matches;
    }
    return {
      get matches() {
        return mediaQueryState[query];
      },
      media: query,
      addEventListener: jest.fn((event: string, cb: (e: { matches: boolean }) => void) => {
        if (event === "change") {
          mediaQueryListeners[query].push(cb);
        }
      }),
      removeEventListener: jest.fn((event: string, cb: (e: { matches: boolean }) => void) => {
        mediaQueryListeners[query] = (mediaQueryListeners[query] ?? []).filter((fn) => fn !== cb);
      }),
    };
  });
}

function triggerMediaChange(query: string, matches: boolean) {
  setMatches(query, matches);
  mediaQueryListeners[query]?.forEach((cb) => cb({ matches }));
}

function getUtils(): AccessibilityUtils {
  return (window as unknown as { accessibilityUtils: AccessibilityUtils }).accessibilityUtils;
}

function getVideoController(): VideoController {
  return (window as unknown as { reducedMotionVideoController: VideoController })
    .reducedMotionVideoController;
}

function loadModule() {
  jest.resetModules();
  Object.keys(mediaQueryListeners).forEach((key) => delete mediaQueryListeners[key]);
  Object.keys(mediaQueryState).forEach((key) => delete mediaQueryState[key]);
  require("./accessibility");
}

function buildSubmenuItem() {
  document.body.innerHTML = `
    <ul>
      <li class="menu-item-has-children">
        <a href="/parent">Parent</a>
        <ul class="sub-menu">
          <li><a href="/child-1">Child 1</a></li>
          <li><a href="/child-2">Child 2</a></li>
        </ul>
      </li>
    </ul>
  `;
}

describe("accessibility.ts — submenu accessibility", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    buildSubmenuItem();
    loadModule();
    document.dispatchEvent(new Event("DOMContentLoaded"));
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("marks the body as JS-enabled", () => {
    expect(document.body.classList.contains("accessibility-js-enabled")).toBe(true);
  });

  it("inserts a toggle button right after the parent link", () => {
    const link = document.querySelector('a[href="/parent"]') as HTMLElement;

    expect(link.nextElementSibling?.className).toBe("submenu-toggle");
  });

  it("collapses submenu links to tabindex -1 by default", () => {
    const childLink = document.querySelector('a[href="/child-1"]') as HTMLElement;

    expect(childLink.getAttribute("tabindex")).toBe("-1");
  });

  it("expands the submenu and focuses the first link on toggle click", () => {
    const toggle = document.querySelector(".submenu-toggle") as HTMLButtonElement;
    const firstChild = document.querySelector('a[href="/child-1"]') as HTMLElement;
    jest.spyOn(firstChild, "focus");

    toggle.click();

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(
      document.querySelector(".menu-item-has-children")?.classList.contains("submenu-active")
    ).toBe(true);
    expect(firstChild.getAttribute("tabindex")).toBe("0");
    expect(firstChild.focus).toHaveBeenCalled();
  });

  it("collapses the submenu on a second toggle click", () => {
    const toggle = document.querySelector(".submenu-toggle") as HTMLButtonElement;

    toggle.click();
    toggle.click();

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(
      document.querySelector(".menu-item-has-children")?.classList.contains("submenu-active")
    ).toBe(false);
  });

  it("toggles the submenu on Space and Enter keydown", () => {
    const toggle = document.querySelector(".submenu-toggle") as HTMLButtonElement;

    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    toggle.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("collapses and refocuses the toggle on Escape from within the submenu", () => {
    const toggle = document.querySelector(".submenu-toggle") as HTMLButtonElement;
    const submenu = document.querySelector(".sub-menu") as HTMLElement;
    jest.spyOn(toggle, "focus");
    toggle.click();

    submenu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.focus).toHaveBeenCalled();
  });

  it("collapses the submenu once focus moves entirely outside it", async () => {
    const toggle = document.querySelector(".submenu-toggle") as HTMLButtonElement;
    const submenu = document.querySelector(".sub-menu") as HTMLElement;
    const outside = document.createElement("button");
    document.body.append(outside);
    toggle.click();

    submenu.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    outside.focus();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps the submenu open when focus moves to another element still inside it", async () => {
    const toggle = document.querySelector(".submenu-toggle") as HTMLButtonElement;
    const submenu = document.querySelector(".sub-menu") as HTMLElement;
    const secondChild = document.querySelector('a[href="/child-2"]') as HTMLElement;
    toggle.click();

    submenu.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    secondChild.focus();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not add a toggle to menu items missing a submenu", () => {
    document.body.innerHTML = `
      <li class="menu-item-has-children">
        <a href="/solo">Solo</a>
      </li>
    `;

    loadModule();
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.querySelector(".submenu-toggle")).toBeNull();
  });
});

describe("accessibility.ts — reduced-motion video controller", () => {
  function buildVideo(attrs: Record<string, string> = {}) {
    document.body.innerHTML = "";
    const wrapper = document.createElement("div");
    const video = document.createElement("video");
    Object.entries(attrs).forEach(([key, value]) => video.setAttribute(key, value));
    wrapper.append(video);
    document.body.append(wrapper);
    jest.spyOn(video, "play").mockReturnValue(Promise.resolve());
    jest.spyOn(video, "pause").mockImplementation(() => {});
    return video;
  }

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("pauses and marks already-present videos as reduced-motion-paused on init when preferred", () => {
    const video = buildVideo({ autoplay: "true" });
    mockMatchMedia(true);

    loadModule();

    expect(video.pause).toHaveBeenCalled();
    expect(video.hasAttribute("autoplay")).toBe(false);
    expect(video.getAttribute("data-reduced-motion-paused")).toBe("true");
    expect(video.muted).toBe(true);
  });

  it("adds native controls to a paused video that had none", () => {
    const video = buildVideo({ autoplay: "true" });
    mockMatchMedia(true);

    loadModule();

    expect(video.getAttribute("controls")).toBe("true");
    expect(video.getAttribute("data-controls-added")).toBe("true");
  });

  it("does not touch a video the user has already overridden", () => {
    const video = buildVideo({ autoplay: "true", "data-user-override": "true" });
    mockMatchMedia(true);

    loadModule();

    expect(video.pause).not.toHaveBeenCalled();
  });

  it("adds a reduced-motion indicator next to the paused video", () => {
    const video = buildVideo({ autoplay: "true" });
    mockMatchMedia(true);

    loadModule();

    const indicator = video.parentElement?.querySelector(".reduced-motion-indicator");
    expect(indicator).not.toBeNull();
    expect(indicator?.querySelector(".text")?.textContent).toBe(
      "Video paused (Reduced motion mode)"
    );
  });

  it("does not pause videos when reduced motion is not preferred", () => {
    const video = buildVideo({ autoplay: "true" });
    mockMatchMedia(false);

    loadModule();

    expect(video.pause).not.toHaveBeenCalled();
    expect(video.hasAttribute("data-reduced-motion-paused")).toBe(false);
  });

  it("restores a video and removes its indicator once reduced motion is no longer preferred", () => {
    const video = buildVideo({ autoplay: "true" });
    mockMatchMedia(true);
    loadModule();
    expect(video.getAttribute("data-reduced-motion-paused")).toBe("true");

    triggerMediaChange("(prefers-reduced-motion: reduce)", false);

    expect(video.hasAttribute("data-reduced-motion-paused")).toBe(false);
    expect(video.hasAttribute("controls")).toBe(false);
    expect(video.getAttribute("autoplay")).toBe("true");
    expect(document.querySelector(".reduced-motion-indicator")).toBeNull();
  });

  it("lets the user resume playback via the play-anyway button", () => {
    const video = buildVideo({ autoplay: "true" });
    mockMatchMedia(true);
    loadModule();
    const playButton = document.querySelector(".play-anyway-btn") as HTMLButtonElement;

    playButton.click();

    expect(video.getAttribute("data-user-interacted")).toBe("true");
    expect(video.getAttribute("data-user-override")).toBe("true");
    expect(video.play).toHaveBeenCalled();
    expect(document.querySelector(".reduced-motion-indicator")).toBeNull();
  });

  it("re-checks and pauses videos on demand via checkVideos", () => {
    const video = buildVideo({ autoplay: "true" });
    mockMatchMedia(false);
    loadModule();
    expect(video.pause).not.toHaveBeenCalled();

    setMatches("(prefers-reduced-motion: reduce)", true);
    getVideoController().checkVideos();

    expect(video.pause).toHaveBeenCalled();
  });

  it("pauses a video added later via a DOM mutation while reduced motion is active", async () => {
    document.body.innerHTML = "";
    mockMatchMedia(true);
    loadModule();

    const wrapper = document.createElement("div");
    const video = document.createElement("video");
    video.setAttribute("autoplay", "true");
    jest.spyOn(video, "pause").mockImplementation(() => {});
    wrapper.append(video);
    document.body.append(wrapper);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    expect(video.pause).toHaveBeenCalled();
  });
});

describe("accessibility.ts — general motion preference", () => {
  afterEach(() => {
    document.body.className = "";
    document.documentElement.style.scrollBehavior = "";
    document.body.style.scrollBehavior = "";
  });

  it("adds the reduce-motion class and sets scroll behavior to auto on load when preferred", () => {
    mockMatchMedia(true);

    loadModule();

    expect(document.body.classList.contains("reduce-motion")).toBe(true);
    expect(document.documentElement.style.scrollBehavior).toBe("auto");
  });

  it("does not add the reduce-motion class when not preferred", () => {
    mockMatchMedia(false);

    loadModule();

    expect(document.body.classList.contains("reduce-motion")).toBe(false);
  });

  it("dispatches a motionPreferenceChanged event reflecting the current preference", () => {
    mockMatchMedia(true);
    const handler = jest.fn();
    window.addEventListener("motionPreferenceChanged", handler);

    loadModule();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { prefersReducedMotion: true } })
    );
    window.removeEventListener("motionPreferenceChanged", handler);
  });

  it("removes the reduce-motion class when the system preference changes back", () => {
    mockMatchMedia(true);
    loadModule();
    expect(document.body.classList.contains("reduce-motion")).toBe(true);

    triggerMediaChange("(prefers-reduced-motion: reduce)", false);

    expect(document.body.classList.contains("reduce-motion")).toBe(false);
    expect(document.documentElement.style.scrollBehavior).toBe("");
  });
});

describe("accessibility.ts — window.accessibilityUtils", () => {
  afterEach(() => {
    document.body.className = "";
  });

  it("prefersReducedMotion reflects the current matchMedia state", () => {
    mockMatchMedia(true);
    loadModule();

    expect(getUtils().prefersReducedMotion()).toBe(true);
  });

  it("createMediaQueryListener invokes the handler immediately and again on change", () => {
    mockMatchMedia(false);
    loadModule();
    const handler = jest.fn();

    getUtils().createMediaQueryListener("(min-width: 800px)", handler);
    expect(handler).toHaveBeenCalledWith(false);

    triggerMediaChange("(min-width: 800px)", true);
    expect(handler).toHaveBeenCalledWith(true);
  });

  it("createMediaQueryListener's cleanup function stops future notifications", () => {
    mockMatchMedia(false);
    loadModule();
    const handler = jest.fn();

    const cleanup = getUtils().createMediaQueryListener("(min-width: 800px)", handler);
    cleanup();
    handler.mockClear();
    triggerMediaChange("(min-width: 800px)", true);

    expect(handler).not.toHaveBeenCalled();
  });

  it("addMotionSensitiveElement calls onReduce or onRestore based on the current preference", () => {
    mockMatchMedia(true);
    loadModule();
    const onReduce = jest.fn();
    const onRestore = jest.fn();

    getUtils().addMotionSensitiveElement(document.createElement("div"), onReduce, onRestore);

    expect(onReduce).toHaveBeenCalled();
    expect(onRestore).not.toHaveBeenCalled();
  });

  it("composeMotionHandlers calls every handler with the same value", () => {
    mockMatchMedia(false);
    loadModule();
    const first = jest.fn();
    const second = jest.fn();

    getUtils().composeMotionHandlers(first, second)(true);

    expect(first).toHaveBeenCalledWith(true);
    expect(second).toHaveBeenCalledWith(true);
  });
});
