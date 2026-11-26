const INDICATOR_CLASS = "reduced-motion-indicator";
const INDICATOR_SELECTOR = ".reduced-motion-indicator";
const PLAY_BUTTON_SELECTOR = ".play-anyway-btn";
const MESSAGE_TEXT_SELECTOR = ".text";

const BUTTON_BACKGROUND = "rgba(255, 255, 255, 0.2)";
const BUTTON_HOVER_BACKGROUND = "rgba(255, 255, 255, 0.3)";

const DEFAULT_PAUSE_MESSAGE = "Video paused (Reduced motion mode)";
const DEFAULT_PLAY_BUTTON_LABEL = "Play anyway";

const INDICATOR_STYLES = `
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

const PLAY_BUTTON_STYLES = `
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

interface IndicatorTranslations {
  pauseMessage: string;
  playButton: string;
}

interface AccessibilityI18n {
  accessibility?: {
    video_paused?: string;
    play_anyway?: string;
  };
}

function readVideoTranslations(): IndicatorTranslations {
  const { i18n } = window as unknown as { i18n?: AccessibilityI18n };

  if (i18n?.accessibility) {
    return {
      pauseMessage: i18n.accessibility.video_paused || DEFAULT_PAUSE_MESSAGE,
      playButton: i18n.accessibility.play_anyway || DEFAULT_PLAY_BUTTON_LABEL,
    };
  }

  return { pauseMessage: DEFAULT_PAUSE_MESSAGE, playButton: DEFAULT_PLAY_BUTTON_LABEL };
}

function createIndicator(): HTMLDivElement {
  const translations = readVideoTranslations();

  const indicator = document.createElement("div");
  indicator.className = INDICATOR_CLASS;
  indicator.innerHTML = `
    <div class="reduced-motion-message">
      <span class="icon">⏸️</span>
      <span class="text"></span>
      <button class="play-anyway-btn" type="button"></button>
    </div>
  `;
  indicator.querySelector(MESSAGE_TEXT_SELECTOR)!.textContent = translations.pauseMessage;
  indicator.querySelector(PLAY_BUTTON_SELECTOR)!.textContent = translations.playButton;
  indicator.style.cssText = INDICATOR_STYLES;
  return indicator;
}

function createPlayAnywayClickHandler(video: HTMLVideoElement, indicator: HTMLDivElement) {
  return (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();

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
  };
}

function bindPlayButton(video: HTMLVideoElement, indicator: HTMLDivElement): void {
  const playButton = indicator.querySelector(PLAY_BUTTON_SELECTOR) as HTMLButtonElement | null;
  if (!playButton) {
    return;
  }

  playButton.style.cssText = PLAY_BUTTON_STYLES;

  playButton.addEventListener("mouseenter", () => {
    playButton.style.background = BUTTON_HOVER_BACKGROUND;
  });
  playButton.addEventListener("mouseleave", () => {
    playButton.style.background = BUTTON_BACKGROUND;
  });
  playButton.addEventListener("click", createPlayAnywayClickHandler(video, indicator));
}

function ensureParentPositioning(element: HTMLElement): void {
  const parent = element.parentElement;
  if (parent && window.getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }
}

export function addIndicatorToVideo(video: HTMLVideoElement): void {
  if (video.parentElement?.querySelector(INDICATOR_SELECTOR)) {
    return;
  }

  const indicator = createIndicator();
  bindPlayButton(video, indicator);
  ensureParentPositioning(video);
  video.parentElement?.appendChild(indicator);
}

export function removeAllIndicators(): void {
  document.querySelectorAll(INDICATOR_SELECTOR).forEach((indicator) => indicator.remove());
}
