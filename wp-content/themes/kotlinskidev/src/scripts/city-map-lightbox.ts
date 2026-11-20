import { lockScroll, unlockScroll } from "@utils/scroll-lock";

const LOCK_OWNER = "city-map-lightbox";
const EXPAND_BUTTON_SELECTOR = "[data-city-map-expand]";
const CLOSE_BUTTON_SELECTOR = "[data-city-map-close]";
const FRAME_SELECTOR = ".kt-city-map-lightbox__frame";
const OPEN_CLASS = "is-open";

let overlay: HTMLElement | null = null;
let frame: HTMLIFrameElement | null = null;

const buildLightbox = (): HTMLElement => {
  const el = document.createElement("div");
  el.className = "kt-city-map-lightbox";
  el.innerHTML =
    '<div class="kt-city-map-lightbox__dialog" role="dialog" aria-modal="true">' +
    '<button type="button" class="kt-city-map-lightbox__close" data-city-map-close>&times;</button>' +
    '<iframe class="kt-city-map-lightbox__frame" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
    "</div>";
  document.body.appendChild(el);
  return el;
};

const closeLightbox = (): void => {
  if (!overlay || !overlay.classList.contains(OPEN_CLASS)) {
    return;
  }
  overlay.classList.remove(OPEN_CLASS);
  unlockScroll(LOCK_OWNER);
  if (frame) {
    frame.src = "";
  }
};

const createOverlay = (): HTMLElement => {
  const created = buildLightbox();
  frame = created.querySelector<HTMLIFrameElement>(FRAME_SELECTOR);

  created.addEventListener("click", (event) => {
    if (event.target === created) {
      closeLightbox();
    }
  });
  created
    .querySelector<HTMLButtonElement>(CLOSE_BUTTON_SELECTOR)
    ?.addEventListener("click", closeLightbox);
  return created;
};

const openLightbox = (src: string, title: string): void => {
  if (!overlay) {
    overlay = createOverlay();
  }

  if (frame) {
    frame.src = src;
    frame.title = title;
  }
  overlay.classList.add(OPEN_CLASS);
  lockScroll(LOCK_OWNER);
};

const bindExpandButton = (button: HTMLButtonElement): void => {
  button.addEventListener("click", () => {
    const src = button.dataset.cityMapSrc ?? "";
    const title = button.dataset.cityMapTitle ?? "";
    if (src) {
      openLightbox(src, title);
    }
  });
};

const init = (): void => {
  const buttons = document.querySelectorAll<HTMLButtonElement>(EXPAND_BUTTON_SELECTOR);
  if (buttons.length === 0) {
    return;
  }

  buttons.forEach(bindExpandButton);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
