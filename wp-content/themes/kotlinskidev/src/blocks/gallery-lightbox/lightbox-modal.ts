import { lockScroll, unlockScroll } from "@utils/scroll-lock";
import { trackEvent } from "../../scripts/track-event";
import type { GalleryLightboxSettings, GalleryMedia } from "./gallery-data";
import { buildModalHTML, MODAL_ID } from "./modal-html";
import { wireActiveSlideMedia, type ActiveSlideMedia, type LightboxSwiper } from "./slide-media";

const SCROLL_LOCK_OWNER = "gallery-lightbox";
let openingToken = 0;

type Sanitizer = typeof import("dompurify").default;

const importSanitizerAndStyleLoader = () =>
  Promise.all([import("dompurify"), import("@utils/carousel/loadSwiperStyles")]);

const importSwiperRuntime = (settings: GalleryLightboxSettings) =>
  Promise.all([
    import("@utils/carousel/initSwiper"),
    import("@utils/carousel/effectModules").then(({ loadEffectModules }) =>
      loadEffectModules(settings.transitionEffect)
    ),
  ]);

function showModal(modal: HTMLElement): void {
  requestAnimationFrame(() => {
    modal.classList.add("is-open");
    modal.querySelector<HTMLElement>(".gallery-lightbox-close")?.focus({ preventScroll: true });
  });
}

interface ModalClosingContext {
  modal: HTMLElement;
  swiper: LightboxSwiper;
  media: ActiveSlideMedia;
  trigger: HTMLElement;
}

function wireModalClosing({ modal, swiper, media, trigger }: ModalClosingContext): void {
  const controller = new AbortController();
  const { signal } = controller;

  const closeModal = (): void => {
    media.pauseActiveVideo();
    media.teardownZoom();
    controller.abort();
    modal.classList.remove("is-open");
    modal.addEventListener(
      "transitionend",
      () => {
        swiper.destroy(true, true);
        modal.remove();
        unlockScroll(SCROLL_LOCK_OWNER);
        trigger.focus({ preventScroll: true });
      },
      { once: true }
    );
  };

  modal.querySelector(".gallery-lightbox-close")?.addEventListener("click", closeModal, { signal });
  modal.addEventListener(
    "click",
    (e) => {
      if (e.target === modal) {
        closeModal();
      }
    },
    { signal }
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    },
    { signal }
  );
}

export interface OpenModalRequest {
  images: GalleryMedia[];
  startIndex: number;
  trigger: HTMLElement;
  settings: GalleryLightboxSettings;
  onSlideChange?: (index: number) => void;
}

function mountModal(DOMPurify: Sanitizer, request: OpenModalRequest): HTMLElement {
  document.getElementById(MODAL_ID)?.remove();
  document.body.insertAdjacentHTML(
    "beforeend",
    DOMPurify.sanitize(buildModalHTML(request.images, request.startIndex, request.settings))
  );
  return document.getElementById(MODAL_ID) as HTMLElement;
}

async function activateModal(modal: HTMLElement, request: OpenModalRequest): Promise<void> {
  const { images, startIndex, trigger, settings, onSlideChange } = request;
  const swiperEl = modal.querySelector<HTMLElement>(".gallery-lightbox-swiper")!;

  const [{ initSwiper }, effectModules] = await importSwiperRuntime(settings);
  if (!modal.isConnected) {
    return;
  }

  const swiper = initSwiper(
    swiperEl,
    { ...settings, slidesPerView: 1 },
    {
      initialSlide: startIndex,
      forceLoop: images.length > 1 && (settings.loop ?? true),
      slideCount: images.length,
      onSlideChange,
      effectModules,
    }
  );

  const media = wireActiveSlideMedia(swiper, settings);
  media.playActiveVideoIfEnabled();
  trackEvent("lightbox_open", {
    item_name: images[startIndex]?.alt ?? "",
    item_index: startIndex,
  });

  showModal(modal);
  wireModalClosing({ modal, swiper, media, trigger });
}

export const openModal = async (request: OpenModalRequest): Promise<void> => {
  document.getElementById(MODAL_ID)?.remove();
  lockScroll(SCROLL_LOCK_OWNER);
  const token = ++openingToken;

  let DOMPurify: Sanitizer;
  try {
    const [purifyModule, { loadSwiperStyles }] = await importSanitizerAndStyleLoader();
    DOMPurify = purifyModule.default;
    await loadSwiperStyles(request.settings);
  } catch {
    if (token === openingToken) {
      unlockScroll(SCROLL_LOCK_OWNER);
    }
    return;
  }

  if (token !== openingToken) {
    return;
  }

  await activateModal(mountModal(DOMPurify, request), request);
};
