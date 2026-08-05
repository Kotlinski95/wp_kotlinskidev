import { setScrollBehavior } from "./utils";

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("accessibility-js-enabled");

  const menuItems = document.querySelectorAll(".menu-item-has-children");

  menuItems.forEach((item) => {
    const link = item.querySelector("a");
    const submenu = item.querySelector(".sub-menu");
    if (!link || !submenu) {
      return;
    }

    const toggleBtn = document.createElement("button");
    toggleBtn.setAttribute("type", "button");
    toggleBtn.setAttribute("aria-haspopup", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("tabindex", "0");
    toggleBtn.className = "submenu-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle submenu");

    toggleBtn.innerHTML = "&#x25be;";

    link.insertAdjacentElement("afterend", toggleBtn);

    const setSubmenuTabbables = (active: boolean) => {
      const subLinks = submenu.querySelectorAll("a");
      subLinks.forEach((subLink) => {
        subLink.setAttribute("tabindex", active ? "0" : "-1");
      });
      const innerToggles = submenu.querySelectorAll(".submenu-toggle");
      innerToggles.forEach((btn) => {
        btn.setAttribute("tabindex", active ? "0" : "-1");
      });
    };

    const toggleSubmenu = () => {
      const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!expanded));
      item.classList.toggle("submenu-active", !expanded);
      setSubmenuTabbables(!expanded);
      if (!expanded) {
        const firstSubLink = submenu.querySelector("a");
        if (firstSubLink) {
          firstSubLink.focus();
        }
      }
    };

    submenu.addEventListener("keydown", (e) => {
      const event = e as KeyboardEvent;
      if (event.key === "Escape") {
        toggleBtn.setAttribute("aria-expanded", "false");
        item.classList.remove("submenu-active");
        setSubmenuTabbables(false);
        toggleBtn.focus();
      }
    });

    setSubmenuTabbables(false);

    toggleBtn.addEventListener("click", toggleSubmenu);
    toggleBtn.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleSubmenu();
      }
    });

    submenu.addEventListener("focusout", () => {
      setTimeout(() => {
        if (!submenu.contains(document.activeElement)) {
          toggleBtn.setAttribute("aria-expanded", "false");
          item.classList.remove("submenu-active");
          setSubmenuTabbables(false);
        }
      }, 0);
    });
  });
});

// =============================================================================
// REDUCED MOTION VIDEO CONTROL
// =============================================================================

type VideoState = {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
};

const getVideoSelectors = (): string[] => [
  ".wp-block-cover video",
  ".wp-block-cover-image video",
  "video[autoplay]",
  'video[data-autoplay="true"]',
  ".hero-banner video",
  ".background-video",
];

const extractVideoState = (video: HTMLVideoElement): VideoState => ({
  autoplay: video.hasAttribute("autoplay"),
  muted: video.muted,
  loop: video.loop,
  controls: video.hasAttribute("controls"),
});

const getVideoTranslations = () => {
  const i18n = (window as any).i18n;

  const defaults = {
    pauseMessage: "Video paused (Reduced motion mode)",
    playButton: "Play anyway",
  };

  if (i18n?.accessibility) {
    return {
      pauseMessage: i18n.accessibility.video_paused || defaults.pauseMessage,
      playButton: i18n.accessibility.play_anyway || defaults.playButton,
    };
  }

  return defaults;
};

const createVideoIndicator = (): HTMLDivElement => {
  const translations = getVideoTranslations();

  const indicator = document.createElement("div");
  indicator.className = "reduced-motion-indicator";
  indicator.innerHTML = `
    <div class="reduced-motion-message">
      <span class="icon">⏸️</span>
      <span class="text"></span>
      <button class="play-anyway-btn" type="button"></button>
    </div>
  `;
  indicator.querySelector(".text")!.textContent = translations.pauseMessage;
  indicator.querySelector(".play-anyway-btn")!.textContent = translations.playButton;

  applyIndicatorStyles(indicator);
  return indicator;
};

const applyIndicatorStyles = (indicator: HTMLDivElement): void => {
  indicator.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    text-align: center;
    z-index: 1000;
    pointer-events: auto;
    backdrop-filter: blur(4px);
  `;
};

const applyButtonStyles = (button: HTMLButtonElement): void => {
  button.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    margin-top: 0.5rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  `;
};

const createVideoStateManager = () => {
  const videoStates = new Map<HTMLVideoElement, VideoState>();

  return {
    store: (video: HTMLVideoElement, state: VideoState) => videoStates.set(video, state),
    retrieve: (video: HTMLVideoElement) => videoStates.get(video),
    has: (video: HTMLVideoElement) => videoStates.has(video),
    clear: () => videoStates.clear(),
  };
};

const VideoOperations = {
  getTargetVideos: (): HTMLVideoElement[] =>
    getVideoSelectors().flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLVideoElement>(selector))
    ),

  pauseVideo: (video: HTMLVideoElement): void => {
    if (video.hasAttribute("data-user-override")) {
      return;
    }

    video.pause();
    video.removeAttribute("autoplay");
    video.setAttribute("data-reduced-motion-paused", "true");

    if (!video.hasAttribute("controls")) {
      video.setAttribute("controls", "true");
      video.setAttribute("data-controls-added", "true");
    }

    video.muted = true;
    video.setAttribute("aria-label", "Video paused due to reduced motion preference");
    video.setAttribute("title", "Video paused (Reduced motion mode) - Click to play manually");
  },

  restoreVideo: (video: HTMLVideoElement, originalState: VideoState): void => {
    if (originalState.autoplay) {
      video.setAttribute("autoplay", "true");
      if (!video.hasAttribute("data-user-interacted")) {
        video.play().catch(() => console.warn("Autoplay prevented by browser policy"));
      }
    }

    video.muted = originalState.muted;
    video.loop = originalState.loop;

    if (video.hasAttribute("data-controls-added")) {
      video.removeAttribute("controls");
      video.removeAttribute("data-controls-added");
    }

    video.removeAttribute("data-reduced-motion-paused");
    video.removeAttribute("aria-label");
    video.removeAttribute("title");
  },

  ensureParentPositioning: (element: HTMLElement): void => {
    const parent = element.parentElement;
    if (parent && window.getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
  },
};

const createButtonHandlers = (video: HTMLVideoElement, indicator: HTMLDivElement) => ({
  onMouseEnter: (button: HTMLButtonElement) => () => {
    button.style.background = "rgba(255, 255, 255, 0.3)";
  },

  onMouseLeave: (button: HTMLButtonElement) => () => {
    button.style.background = "rgba(255, 255, 255, 0.2)";
  },

  onClick: () => (e: Event) => {
    e.stopPropagation();
    e.preventDefault();

    video.setAttribute("data-user-interacted", "true");
    video.setAttribute("data-user-override", "true");

    video.removeAttribute("data-reduced-motion-paused");

    video.removeAttribute("aria-label");
    video.removeAttribute("title");

    video.style.opacity = "1";
    video.style.pointerEvents = "auto";

    video.play().catch((error) => {
      console.warn("Video play failed:", error);
    });

    indicator.remove();
  },
});

const setupButtonInteractions = (video: HTMLVideoElement, indicator: HTMLDivElement): void => {
  const playBtn = indicator.querySelector(".play-anyway-btn") as HTMLButtonElement;
  if (!playBtn) {
    return;
  }

  applyButtonStyles(playBtn);
  const handlers = createButtonHandlers(video, indicator);

  playBtn.addEventListener("mouseenter", handlers.onMouseEnter(playBtn));
  playBtn.addEventListener("mouseleave", handlers.onMouseLeave(playBtn));
  playBtn.addEventListener("click", handlers.onClick());
};

const addIndicatorToVideo = (video: HTMLVideoElement): void => {
  if (video.parentElement?.querySelector(".reduced-motion-indicator")) {
    return;
  }

  const indicator = createVideoIndicator();
  setupButtonInteractions(video, indicator);
  VideoOperations.ensureParentPositioning(video);
  video.parentElement?.appendChild(indicator);
};

const removeAllIndicators = (): void => {
  document.querySelectorAll(".reduced-motion-indicator").forEach((indicator) => indicator.remove());
};

const createReducedMotionVideoController = () => {
  const stateManager = createVideoStateManager();
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const pauseAllVideos = (): void => {
    VideoOperations.getTargetVideos().forEach((video) => {
      if (!stateManager.has(video)) {
        stateManager.store(video, extractVideoState(video));
      }
      VideoOperations.pauseVideo(video);
    });
  };

  const restoreAllVideos = (): void => {
    document
      .querySelectorAll<HTMLVideoElement>("video[data-reduced-motion-paused]")
      .forEach((video) => {
        const originalState = stateManager.retrieve(video);
        if (originalState) {
          VideoOperations.restoreVideo(video, originalState);
        }
      });
  };

  const addAllIndicators = (): void => {
    document
      .querySelectorAll<HTMLVideoElement>("video[data-reduced-motion-paused]")
      .forEach(addIndicatorToVideo);
  };

  const handleMotionPreference = (prefersReducedMotion: boolean): void => {
    if (prefersReducedMotion) {
      pauseAllVideos();
      addAllIndicators();
    } else {
      restoreAllVideos();
      removeAllIndicators();
    }
  };

  const init = (): void => {
    handleMotionPreference(mediaQuery.matches);
    mediaQuery.addEventListener("change", (e) => handleMotionPreference(e.matches));

    const observer = new MutationObserver(() => {
      if (mediaQuery.matches) {
        pauseAllVideos();
        addAllIndicators();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  return {
    init,
    checkVideos: () => handleMotionPreference(mediaQuery.matches),
  };
};

const initializeVideoController = () => {
  const videoController = createReducedMotionVideoController();
  videoController.init();

  (window as any).reducedMotionVideoController = videoController;
  return videoController;
};

const videoController =
  document.readyState === "loading"
    ? (() => {
        let controller: ReturnType<typeof createReducedMotionVideoController>;
        document.addEventListener("DOMContentLoaded", () => {
          controller = initializeVideoController();
        });
        return () => controller;
      })()
    : initializeVideoController();

// =============================================================================
// GENERAL MOTION PREFERENCE HANDLING
// =============================================================================

const DOMOperations = {
  addBodyClass: (className: string) => document.body.classList.add(className),
  removeBodyClass: (className: string) => document.body.classList.remove(className),
  setScrollBehavior: (behavior: ScrollBehavior) => setScrollBehavior(behavior),
  dispatchMotionEvent: (prefersReducedMotion: boolean) =>
    window.dispatchEvent(
      new CustomEvent("motionPreferenceChanged", {
        detail: { prefersReducedMotion },
      })
    ),
};

const createMotionHandlers = () => ({
  onReducedMotion: () => {
    DOMOperations.addBodyClass("reduce-motion");
    DOMOperations.setScrollBehavior("auto");
    DOMOperations.dispatchMotionEvent(true);
  },

  onFullMotion: () => {
    DOMOperations.removeBodyClass("reduce-motion");
    DOMOperations.setScrollBehavior("");
    DOMOperations.dispatchMotionEvent(false);
  },
});

const handleMotionPreference = (prefersReducedMotion: boolean) => {
  const handlers = createMotionHandlers();
  return prefersReducedMotion ? handlers.onReducedMotion() : handlers.onFullMotion();
};

const createMotionPreferenceListener = () => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  handleMotionPreference(mediaQuery.matches);

  mediaQuery.addEventListener("change", (e) => handleMotionPreference(e.matches));

  return mediaQuery;
};

createMotionPreferenceListener();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const MotionUtils = {
  prefersReducedMotion: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  createMediaQueryListener: (query: string, handler: (matches: boolean) => void) => {
    const mediaQuery = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => handler(e.matches);

    handler(mediaQuery.matches);

    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  },
};
const createMotionSensitiveHandler = (
  element: HTMLElement,
  onReduce: () => void,
  onRestore: () => void
) => {
  return MotionUtils.createMediaQueryListener("(prefers-reduced-motion: reduce)", (matches) =>
    matches ? onReduce() : onRestore()
  );
};

const getVideoController = () => {
  const controller = typeof videoController === "function" ? videoController() : videoController;
  return controller;
};

const createAccessibilityUtils = () => ({
  prefersReducedMotion: MotionUtils.prefersReducedMotion,

  checkVideos: () => getVideoController()?.checkVideos(),

  addMotionSensitiveElement: createMotionSensitiveHandler,

  createMediaQueryListener: MotionUtils.createMediaQueryListener,

  composeMotionHandlers:
    (...handlers: Array<(matches: boolean) => void>) =>
    (matches: boolean) =>
      handlers.forEach((handler) => handler(matches)),
});

(window as any).accessibilityUtils = createAccessibilityUtils();
