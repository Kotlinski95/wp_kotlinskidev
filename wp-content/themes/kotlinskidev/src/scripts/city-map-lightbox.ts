import { lockScroll, unlockScroll } from "@utils/scroll-lock";

(() => {
  const LOCK_OWNER = "city-map-lightbox";

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

  const closeLightbox = () => {
    if (!overlay || !overlay.classList.contains("is-open")) {
      return;
    }
    overlay.classList.remove("is-open");
    unlockScroll(LOCK_OWNER);
    if (frame) {
      frame.src = "";
    }
  };

  const openLightbox = (src: string, title: string) => {
    if (!overlay) {
      overlay = buildLightbox();
      frame = overlay.querySelector<HTMLIFrameElement>(".kt-city-map-lightbox__frame");

      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          closeLightbox();
        }
      });
      overlay
        .querySelector<HTMLButtonElement>("[data-city-map-close]")
        ?.addEventListener("click", closeLightbox);
    }

    if (frame) {
      frame.src = src;
      frame.title = title;
    }
    overlay.classList.add("is-open");
    lockScroll(LOCK_OWNER);
  };

  const init = () => {
    const buttons = document.querySelectorAll<HTMLButtonElement>("[data-city-map-expand]");
    if (buttons.length === 0) {
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const src = button.dataset.cityMapSrc ?? "";
        const title = button.dataset.cityMapTitle ?? "";
        if (src) {
          openLightbox(src, title);
        }
      });
    });

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
})();
