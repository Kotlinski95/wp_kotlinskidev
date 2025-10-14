// accessibility.ts
// Adds accessible submenu toggles to WordPress navigation menus

document.addEventListener("DOMContentLoaded", () => {
  // Hide CSS-only arrows if JS is enabled
  document.body.classList.add("accessibility-js-enabled");

  // Select all menu items with submenus
  const menuItems = document.querySelectorAll(".menu-item-has-children");

  menuItems.forEach((item) => {
    // Find the first link inside the menu item
    const link = item.querySelector("a");
    const submenu = item.querySelector(".sub-menu");
    if (!link || !submenu) return;

    // Create a button for toggling submenu
    const toggleBtn = document.createElement("button");
    toggleBtn.setAttribute("type", "button");
    toggleBtn.setAttribute("aria-haspopup", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("tabindex", "0");
    toggleBtn.className = "submenu-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle submenu");

    // Use the same arrow as in CSS :after
    toggleBtn.innerHTML = "&#x25be;";

    // Insert the button after the link
    link.insertAdjacentElement("afterend", toggleBtn);

    // Helper to set submenu links and inner toggles tabindex
    const setSubmenuTabbables = (active: boolean) => {
      // Set all submenu links
      const subLinks = submenu.querySelectorAll("a");
      subLinks.forEach((link) => {
        link.setAttribute("tabindex", active ? "0" : "-1");
      });
      // Set all inner submenu-toggle buttons
      const innerToggles = submenu.querySelectorAll(".submenu-toggle");
      innerToggles.forEach((btn) => {
        btn.setAttribute("tabindex", active ? "0" : "-1");
      });
    };

    // Toggle submenu on click or keyboard
    const toggleSubmenu = () => {
      const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!expanded));
      item.classList.toggle("submenu-active", !expanded);
      setSubmenuTabbables(!expanded);
      if (!expanded) {
        // Focus first submenu link when opened
        const firstSubLink = submenu.querySelector("a");
        if (firstSubLink) firstSubLink.focus();
      }
    };

    // Listen for 'Escape' key on submenu links and toggles
    submenu.addEventListener("keydown", (e) => {
      const event = e as KeyboardEvent;
      if (event.key === "Escape") {
        toggleBtn.setAttribute("aria-expanded", "false");
        item.classList.remove("submenu-active");
        setSubmenuTabbables(false);
        toggleBtn.focus();
      }
    });

    // Initialize submenu links and toggles as not focusable
    setSubmenuTabbables(false);

    toggleBtn.addEventListener("click", toggleSubmenu);
    toggleBtn.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleSubmenu();
      }
    });

    // Close submenu when focus leaves submenu or its links/toggles
    submenu.addEventListener("focusout", (e) => {
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

// Types for better type safety
type VideoState = {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
};

// Pure function to get video selectors
const getVideoSelectors = (): string[] => [
  ".wp-block-cover video",
  ".wp-block-cover-image video",
  "video[autoplay]",
  'video[data-autoplay="true"]',
  ".hero-banner video",
  ".background-video",
];

// Pure function to extract video state
const extractVideoState = (video: HTMLVideoElement): VideoState => ({
  autoplay: video.hasAttribute("autoplay"),
  muted: video.muted,
  loop: video.loop,
  controls: video.hasAttribute("controls"),
});

// Function to get translations from WordPress i18n system
const getVideoTranslations = () => {
  // Check if WordPress i18n translations are available
  const i18n = (window as any).i18n;

  // Default English translations as fallback
  const defaults = {
    pauseMessage: "Video paused (Reduced motion mode)",
    playButton: "Play anyway",
  };

  // Try to get translations from WordPress i18n system first
  if (i18n?.accessibility) {
    return {
      pauseMessage: i18n.accessibility.video_paused || defaults.pauseMessage,
      playButton: i18n.accessibility.play_anyway || defaults.playButton,
    };
  }

  return defaults;
};

// Pure function to create video indicator element
const createVideoIndicator = (): HTMLDivElement => {
  const translations = getVideoTranslations();

  const indicator = document.createElement("div");
  indicator.className = "reduced-motion-indicator";
  indicator.innerHTML = `
    <div class="reduced-motion-message">
      <span class="icon">⏸️</span>
      <span class="text">${translations.pauseMessage}</span>
      <button class="play-anyway-btn" type="button">${translations.playButton}</button>
    </div>
  `;

  // Apply styles using a pure function
  applyIndicatorStyles(indicator);
  return indicator;
};

// Pure function to apply indicator styles
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

// Pure function to apply button styles
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

// Higher-order function to create a state manager
const createVideoStateManager = () => {
  const videoStates = new Map<HTMLVideoElement, VideoState>();

  return {
    store: (video: HTMLVideoElement, state: VideoState) =>
      videoStates.set(video, state),
    retrieve: (video: HTMLVideoElement) => videoStates.get(video),
    has: (video: HTMLVideoElement) => videoStates.has(video),
    clear: () => videoStates.clear(),
  };
};

// Functional approach to video operations
const VideoOperations = {
  // Pure function to get all target videos
  getTargetVideos: (): HTMLVideoElement[] =>
    getVideoSelectors().flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLVideoElement>(selector))
    ),

  // Pure function to pause a video
  pauseVideo: (video: HTMLVideoElement): void => {
    // Skip pausing if user has overridden the reduced motion setting for this video
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
    video.setAttribute(
      "aria-label",
      "Video paused due to reduced motion preference"
    );
    video.setAttribute(
      "title",
      "Video paused (Reduced motion mode) - Click to play manually"
    );
  },

  // Pure function to restore a video
  restoreVideo: (video: HTMLVideoElement, originalState: VideoState): void => {
    if (originalState.autoplay) {
      video.setAttribute("autoplay", "true");
      if (!video.hasAttribute("data-user-interacted")) {
        video
          .play()
          .catch(() => console.log("Autoplay prevented by browser policy"));
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

  // Function to ensure parent positioning
  ensureParentPositioning: (element: HTMLElement): void => {
    const parent = element.parentElement;
    if (parent && window.getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
  },
};

// Higher-order function to create button event handlers
const createButtonHandlers = (
  video: HTMLVideoElement,
  indicator: HTMLDivElement
) => ({
  onMouseEnter: (button: HTMLButtonElement) => () => {
    button.style.background = "rgba(255, 255, 255, 0.3)";
  },

  onMouseLeave: (button: HTMLButtonElement) => () => {
    button.style.background = "rgba(255, 255, 255, 0.2)";
  },

  onClick: () => (e: Event) => {
    e.stopPropagation();
    e.preventDefault();

    // Mark video as user-interacted to prevent re-pausing
    video.setAttribute("data-user-interacted", "true");
    video.setAttribute("data-user-override", "true");

    // Remove the reduced motion paused attribute
    video.removeAttribute("data-reduced-motion-paused");

    // Remove accessibility attributes
    video.removeAttribute("aria-label");
    video.removeAttribute("title");

    // Reset video styling to normal (remove reduced motion CSS effects)
    video.style.opacity = "1";
    video.style.pointerEvents = "auto";

    // Start playing the video
    video.play().catch((error) => {
      console.log("Video play failed:", error);
    });

    // Remove the indicator immediately
    indicator.remove();
  },
});

// Function to setup button interactions
const setupButtonInteractions = (
  video: HTMLVideoElement,
  indicator: HTMLDivElement
): void => {
  const playBtn = indicator.querySelector(
    ".play-anyway-btn"
  ) as HTMLButtonElement;
  if (!playBtn) return;

  applyButtonStyles(playBtn);
  const handlers = createButtonHandlers(video, indicator);

  playBtn.addEventListener("mouseenter", handlers.onMouseEnter(playBtn));
  playBtn.addEventListener("mouseleave", handlers.onMouseLeave(playBtn));
  playBtn.addEventListener("click", handlers.onClick());
};

// Function to add indicator to video
const addIndicatorToVideo = (video: HTMLVideoElement): void => {
  if (video.parentElement?.querySelector(".reduced-motion-indicator")) return;

  const indicator = createVideoIndicator();
  setupButtonInteractions(video, indicator);
  VideoOperations.ensureParentPositioning(video);
  video.parentElement?.appendChild(indicator);
};

// Function to remove all indicators
const removeAllIndicators = (): void => {
  document
    .querySelectorAll(".reduced-motion-indicator")
    .forEach((indicator) => indicator.remove());
};

// Main video controller using functional composition
const createReducedMotionVideoController = () => {
  const stateManager = createVideoStateManager();
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Pure function to handle pausing all videos
  const pauseAllVideos = (): void => {
    VideoOperations.getTargetVideos().forEach((video) => {
      if (!stateManager.has(video)) {
        stateManager.store(video, extractVideoState(video));
      }
      VideoOperations.pauseVideo(video);
    });
  };

  // Pure function to restore all videos
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

  // Pure function to add all indicators
  const addAllIndicators = (): void => {
    document
      .querySelectorAll<HTMLVideoElement>("video[data-reduced-motion-paused]")
      .forEach(addIndicatorToVideo);
  };

  // Main handler function
  const handleMotionPreference = (prefersReducedMotion: boolean): void => {
    if (prefersReducedMotion) {
      pauseAllVideos();
      addAllIndicators();
      console.log("🎥 Reduced motion detected: Autoplay videos paused");
    } else {
      restoreAllVideos();
      removeAllIndicators();
      console.log("🎥 Motion enabled: Autoplay videos restored");
    }
  };

  // Initialize function
  const init = (): void => {
    handleMotionPreference(mediaQuery.matches);
    mediaQuery.addEventListener("change", (e) =>
      handleMotionPreference(e.matches)
    );

    // Setup mutation observer for dynamic content
    const observer = new MutationObserver(() => {
      if (mediaQuery.matches) {
        pauseAllVideos();
        addAllIndicators();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  // Return public API
  return {
    init,
    checkVideos: () => handleMotionPreference(mediaQuery.matches),
  };
};

// Initialize video controller using functional approach
const initializeVideoController = () => {
  const videoController = createReducedMotionVideoController();
  videoController.init();

  // Make available globally
  (window as any).reducedMotionVideoController = videoController;
  return videoController;
};

// Initialize when DOM is ready
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
  removeBodyClass: (className: string) =>
    document.body.classList.remove(className),
  setScrollBehavior: (behavior: string) => {
    document.documentElement.style.scrollBehavior = behavior;
    document.body.style.scrollBehavior = behavior;
  },
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
    console.log("🎭 Reduced motion mode activated");
  },

  onFullMotion: () => {
    DOMOperations.removeBodyClass("reduce-motion");
    DOMOperations.setScrollBehavior("");
    DOMOperations.dispatchMotionEvent(false);
    console.log("🎭 Full motion mode activated");
  },
});

const handleMotionPreference = (prefersReducedMotion: boolean) => {
  const handlers = createMotionHandlers();
  return prefersReducedMotion
    ? handlers.onReducedMotion()
    : handlers.onFullMotion();
};

const createMotionPreferenceListener = () => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  handleMotionPreference(mediaQuery.matches);

  mediaQuery.addEventListener("change", (e) =>
    handleMotionPreference(e.matches)
  );

  return mediaQuery;
};

const motionMediaQuery = createMotionPreferenceListener();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const MotionUtils = {
  prefersReducedMotion: () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  createMediaQueryListener: (
    query: string,
    handler: (matches: boolean) => void
  ) => {
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
  return MotionUtils.createMediaQueryListener(
    "(prefers-reduced-motion: reduce)",
    (matches) => (matches ? onReduce() : onRestore())
  );
};

const getVideoController = () => {
  const controller =
    typeof videoController === "function" ? videoController() : videoController;
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
