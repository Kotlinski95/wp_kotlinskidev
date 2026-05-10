import "swiper/swiper-bundle.css";
import Swiper from "swiper";
import { Navigation, Pagination, Keyboard, Autoplay } from "swiper/modules";
import { buildSwiperConfig } from "@utils/carousel/buildConfig";
import { attachImageZoom } from "@utils/zoom/attachImageZoom";

const MODAL_ID = "gallery-lightbox-modal";

interface GalleryMedia {
  src: string;
  alt: string;
  type: "image" | "video";
  poster: string;
  width: number;
  height: number;
}

const MOBILE_BREAKPOINT: number = (window as any).kotlinskiTheme?.mobileBreakpoint ?? 767;

const parseImages = (gallery: HTMLElement): GalleryMedia[] => {
  const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  if (isMobile && gallery.dataset.mobileImages) {
    try {
      const mobile = JSON.parse(gallery.dataset.mobileImages);
      if (Array.isArray(mobile) && mobile.length) return mobile;
    } catch {
      // fall through to desktop
    }
  }
  try {
    return JSON.parse(gallery.dataset.images ?? "[]");
  } catch {
    return [];
  }
};

const parseSettings = (gallery: HTMLElement) => {
  try {
    return JSON.parse(gallery.dataset.settings ?? "{}");
  } catch {
    return {};
  }
};

const buildModalHTML = (
  images: GalleryMedia[],
  startIndex: number,
  settings: ReturnType<typeof parseSettings>
): string => {
  const {
    showArrows = true,
    showPagination = true,
    arrowsPosition = "sides",
    navColor = "",
    navPlacement = "inside",
    videoControls = true,
    videoAutoplay = false,
    videoLoop = false,
    videoMuted = false,
  } = settings;

  const slides = images
    .map(({ src, alt, type, poster }, i) =>
      type === "video"
        ? `<div class="swiper-slide swiper-slide--video">
              <video
                src="${src}"
                ${poster ? `poster="${poster}"` : ""}
                ${videoControls ? "controls" : ""}
                ${videoLoop ? "loop" : ""}
                ${videoMuted || videoAutoplay ? "muted" : ""}
                playsinline
                preload="metadata"
              ></video>
            </div>`
        : `<div class="swiper-slide">
              <img
                src="${src}"
                alt="${alt}"
                loading="${i === startIndex ? "eager" : "lazy"}"
                decoding="async"
              />
            </div>`
    )
    .join("");

  const isOutside = navPlacement === "outside";
  const hasCustomNav = showArrows && (arrowsPosition !== "sides" || isOutside);
  const navClass = isOutside
    ? `carousel-nav carousel-nav--outside carousel-nav--${arrowsPosition}`
    : `carousel-nav carousel-nav--${arrowsPosition}`;
  const navStyle = navColor
    ? ` style="--carousel-nav-color: ${navColor}; --carousel-nav-border-color: ${navColor}"`
    : "";

  const arrowsHTML = showArrows
    ? hasCustomNav
      ? `<div class="${navClass}"${navStyle}>
          <div class="swiper-button-prev"></div>
          <span class="carousel-nav__counter"></span>
          <div class="swiper-button-next"></div>
        </div>`
      : '<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>'
    : "";

  const insideNav =
    hasCustomNav && !isOutside ? arrowsHTML : showArrows && !hasCustomNav ? arrowsHTML : "";
  const outsideNav = hasCustomNav && isOutside ? arrowsHTML : "";

  return `
    <div id="${MODAL_ID}" class="gallery-lightbox-modal" role="dialog" aria-modal="true" aria-label="Image gallery" tabindex="-1">
      <button class="gallery-lightbox-close" aria-label="Close gallery">&times;</button>
      <div class="gallery-lightbox-swiper swiper">
        <div class="swiper-wrapper">${slides}</div>
        ${insideNav}
        ${showPagination ? '<div class="swiper-pagination"></div>' : ""}
      </div>
      ${outsideNav}
    </div>`;
};

const openModal = (
  images: GalleryMedia[],
  startIndex: number,
  trigger: HTMLElement,
  settings: ReturnType<typeof parseSettings>,
  onSlideChange?: (index: number) => void
): void => {
  document.getElementById(MODAL_ID)?.remove();
  document.body.style.overflow = "hidden";
  document.body.insertAdjacentHTML("beforeend", buildModalHTML(images, startIndex, settings));

  const modal = document.getElementById(MODAL_ID) as HTMLElement;
  const swiperEl = modal.querySelector<HTMLElement>(".gallery-lightbox-swiper")!;

  const config = buildSwiperConfig({ ...settings, slidesPerView: 1 });
  const swiper = new Swiper(swiperEl, {
    modules: [Navigation, Pagination, Keyboard, Autoplay],
    ...config,
    initialSlide: startIndex,
    loop: images.length > 1 && (settings.loop ?? true),
  });

  const counterEl = modal.querySelector<HTMLElement>(".carousel-nav__counter");
  const total = images.length;
  const onSwiperSlideChange = () => {
    const index = swiper.realIndex ?? 0;
    if (counterEl) {
      counterEl.innerHTML = `<span class="carousel-nav__current">${String(index + 1).padStart(2, "0")}</span> / ${String(total).padStart(2, "0")}`;
    }
    onSlideChange?.(index);
  };
  onSwiperSlideChange();
  swiper.on("slideChange", onSwiperSlideChange);

  const pauseActiveVideo = () => {
    const activeSlide = swiper.slides[swiper.activeIndex] as HTMLElement | undefined;
    activeSlide?.querySelector("video")?.pause();
  };

  const playActiveVideoIfEnabled = () => {
    if (!settings.videoAutoplay) return;
    const activeSlide = swiper.slides[swiper.activeIndex] as HTMLElement | undefined;
    activeSlide
      ?.querySelector("video")
      ?.play()
      .catch(() => {});
  };

  let currentZoomTeardown: (() => void) | null = null;
  const attachZoomToActiveSlide = () => {
    currentZoomTeardown?.();
    const activeSlide = swiper.slides[swiper.activeIndex] as HTMLElement | undefined;
    if (activeSlide && !activeSlide.classList.contains("swiper-slide--video")) {
      currentZoomTeardown = attachImageZoom(activeSlide);
    }
  };
  attachZoomToActiveSlide();
  swiper.on("slideChange", () => {
    pauseActiveVideo();
    requestAnimationFrame(() => {
      attachZoomToActiveSlide();
      playActiveVideoIfEnabled();
    });
  });

  playActiveVideoIfEnabled();

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
    modal.querySelector<HTMLElement>(".gallery-lightbox-close")?.focus({ preventScroll: true });
  });

  const controller = new AbortController();
  const { signal } = controller;

  const closeModal = (): void => {
    pauseActiveVideo();
    currentZoomTeardown?.();
    controller.abort();
    modal.classList.remove("is-open");
    modal.addEventListener(
      "transitionend",
      () => {
        swiper.destroy(true, true);
        modal.remove();
        document.body.style.overflow = "";
        trigger.focus({ preventScroll: true });
      },
      { once: true }
    );
  };

  modal.querySelector(".gallery-lightbox-close")?.addEventListener("click", closeModal, { signal });
  modal.addEventListener(
    "click",
    (e) => {
      if (e.target === modal) closeModal();
    },
    { signal }
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") closeModal();
    },
    { signal }
  );
};

const initGalleryLightbox = (gallery: HTMLElement): void => {
  const images = parseImages(gallery);
  if (!images.length) return;

  const settings = parseSettings(gallery);
  const trigger = gallery.querySelector<HTMLElement>(".gallery-lightbox-trigger");
  if (!trigger) return;

  let activeIndex = 0;

  const syncTrigger = (index: number): void => {
    activeIndex = index;
    const item = images[index];
    const countEl = trigger.querySelector<HTMLElement>(".gallery-lightbox-count");
    const badge = trigger.querySelector<HTMLElement>(".gallery-lightbox-video-badge");
    const existingImg = trigger.querySelector<HTMLImageElement>("img");
    const existingVideo = trigger.querySelector<HTMLVideoElement>("video");

    if (item.type === "video") {
      let video = existingVideo;
      if (!video) {
        video = document.createElement("video");
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        existingImg?.replaceWith(video);
      }
      if (item.poster) video.poster = item.poster;
      video.src = item.src;
      video.play().catch(() => {});
      if (badge) badge.style.display = "none";
    } else {
      let img = existingImg;
      if (!img) {
        img = document.createElement("img");
        existingVideo?.pause();
        existingVideo?.replaceWith(img);
      }
      img.src = item.src;
      img.alt = item.alt;
      if (item.width) img.width = item.width;
      if (item.height) img.height = item.height;
      if (item.width && item.height) {
        applyAspectRatio(trigger, item.width, item.height);
      } else {
        applyAspectRatioFromImage(img);
      }
      if (badge) badge.style.display = "none";
    }

    if (item.type === "video" && item.width && item.height) {
      applyAspectRatio(trigger, item.width, item.height);
    }

    if (countEl) {
      countEl.innerHTML = `<span class="gallery-lightbox-count__current">${String(index + 1).padStart(2, "0")}</span> / ${String(images.length).padStart(2, "0")}`;
    }
  };

  const applyAspectRatio = (el: HTMLElement, w: number, h: number): void => {
    if (w && h) el.style.aspectRatio = `${w}/${h}`;
  };

  const applyAspectRatioFromImage = (img: HTMLImageElement): void => {
    if (img.naturalWidth && img.naturalHeight) {
      applyAspectRatio(trigger, img.naturalWidth, img.naturalHeight);
    } else {
      img.addEventListener(
        "load",
        () => applyAspectRatio(trigger, img.naturalWidth, img.naturalHeight),
        { once: true }
      );
    }
  };

  const syncInitialTrigger = (): void => {
    const item = images[0];
    if (!item) return;

    const img = trigger.querySelector<HTMLImageElement>("img");
    const countEl = trigger.querySelector<HTMLElement>(".gallery-lightbox-count");
    const badge = trigger.querySelector<HTMLElement>(".gallery-lightbox-video-badge");

    if (img) {
      img.src = item.type === "video" ? item.poster || item.src : item.src;
      img.alt = item.alt;
      if (item.width) img.width = item.width;
      if (item.height) img.height = item.height;
      if (item.width && item.height) {
        applyAspectRatio(trigger, item.width, item.height);
      } else if (item.type !== "video") {
        applyAspectRatioFromImage(img);
      }
    }
    if (badge) badge.style.display = item.type === "video" ? "" : "none";
    if (countEl) {
      if (images.length > 1) {
        countEl.style.display = "";
        countEl.innerHTML = settings.trackActiveSlide
          ? `<span class="gallery-lightbox-count__current">01</span> / ${String(images.length).padStart(2, "0")}`
          : `+${images.length - 1}`;
      } else {
        countEl.style.display = "none";
      }
    }
  };

  if (
    gallery.dataset.mobileImages &&
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  ) {
    syncInitialTrigger();
  }

  trigger.addEventListener("click", () =>
    openModal(
      images,
      activeIndex,
      trigger,
      settings,
      settings.trackActiveSlide ? syncTrigger : undefined
    )
  );
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>("[data-gallery-lightbox]").forEach(initGalleryLightbox);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
