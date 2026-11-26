import type { GalleryLightboxSettings, GalleryMedia } from "./gallery-data";

const formatCount = (value: number): string => String(value).padStart(2, "0");

const applyAspectRatio = (el: HTMLElement, width: number, height: number): void => {
  if (width && height) {
    el.style.aspectRatio = `${width}/${height}`;
  }
};

const applyAspectRatioFromImage = (trigger: HTMLElement, img: HTMLImageElement): void => {
  if (img.naturalWidth && img.naturalHeight) {
    applyAspectRatio(trigger, img.naturalWidth, img.naturalHeight);
    return;
  }
  img.addEventListener(
    "load",
    () => applyAspectRatio(trigger, img.naturalWidth, img.naturalHeight),
    { once: true }
  );
};

const applyDimensions = (img: HTMLImageElement, item: GalleryMedia): void => {
  if (item.width) {
    img.width = item.width;
  }
  if (item.height) {
    img.height = item.height;
  }
};

const showVideoItem = (trigger: HTMLElement, item: GalleryMedia): void => {
  const existingImg = trigger.querySelector<HTMLImageElement>("img");
  let video = trigger.querySelector<HTMLVideoElement>("video");
  if (!video) {
    video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    existingImg?.replaceWith(video);
  }
  if (item.poster) {
    video.poster = item.poster;
  }
  video.src = item.src;
  video.play().catch(() => {});
};

const showImageItem = (
  trigger: HTMLElement,
  item: GalleryMedia,
  settings: GalleryLightboxSettings
): void => {
  const existingVideo = trigger.querySelector<HTMLVideoElement>("video");
  let img = trigger.querySelector<HTMLImageElement>("img");
  if (!img) {
    img = document.createElement("img");
    existingVideo?.pause();
    existingVideo?.replaceWith(img);
  }
  img.src = item.src;
  img.alt = item.alt;
  applyDimensions(img, item);
  if (settings.lockHeight) {
    return;
  }
  if (item.width && item.height) {
    applyAspectRatio(trigger, item.width, item.height);
  } else {
    applyAspectRatioFromImage(trigger, img);
  }
};

const updateTrackedCount = (countEl: HTMLElement, index: number, total: number): void => {
  let currentSpan = countEl.querySelector<HTMLElement>(".gallery-lightbox-count__current");
  if (!currentSpan) {
    currentSpan = document.createElement("span");
    currentSpan.className = "gallery-lightbox-count__current";
    countEl.textContent = "";
    countEl.append(currentSpan, ` / ${formatCount(total)}`);
  }
  currentSpan.textContent = formatCount(index + 1);
};

export interface TriggerSyncContext {
  trigger: HTMLElement;
  images: GalleryMedia[];
  settings: GalleryLightboxSettings;
}

export const syncTriggerToItem = (
  { trigger, images, settings }: TriggerSyncContext,
  index: number
): void => {
  const item = images[index];
  const countEl = trigger.querySelector<HTMLElement>(".gallery-lightbox-count");
  const badge = trigger.querySelector<HTMLElement>(".gallery-lightbox-video-badge");

  if (item.type === "video") {
    showVideoItem(trigger, item);
  } else {
    showImageItem(trigger, item, settings);
  }
  if (badge) {
    badge.style.display = "none";
  }

  if (!settings.lockHeight && item.type === "video" && item.width && item.height) {
    applyAspectRatio(trigger, item.width, item.height);
  }

  if (countEl) {
    updateTrackedCount(countEl, index, images.length);
  }
};

const renderInitialCount = (
  countEl: HTMLElement,
  images: GalleryMedia[],
  settings: GalleryLightboxSettings
): void => {
  if (images.length <= 1) {
    countEl.style.display = "none";
    return;
  }
  countEl.style.display = "";
  countEl.textContent = "";
  if (!settings.trackActiveSlide) {
    countEl.textContent = `+${images.length - 1}`;
    return;
  }
  const currentSpan = document.createElement("span");
  currentSpan.className = "gallery-lightbox-count__current";
  currentSpan.textContent = "01";
  countEl.append(currentSpan, ` / ${formatCount(images.length)}`);
};

export const syncInitialTrigger = (
  trigger: HTMLElement,
  images: GalleryMedia[],
  settings: GalleryLightboxSettings
): void => {
  const item = images[0];
  if (!item) {
    return;
  }

  const img = trigger.querySelector<HTMLImageElement>("img");
  const countEl = trigger.querySelector<HTMLElement>(".gallery-lightbox-count");
  const badge = trigger.querySelector<HTMLElement>(".gallery-lightbox-video-badge");

  if (img) {
    img.src = item.type === "video" ? item.poster || item.src : item.src;
    img.alt = item.alt;
    applyDimensions(img, item);
    if (item.width && item.height) {
      applyAspectRatio(trigger, item.width, item.height);
    } else if (item.type !== "video") {
      applyAspectRatioFromImage(trigger, img);
    }
  }
  if (badge) {
    badge.style.display = item.type === "video" ? "" : "none";
  }
  if (countEl) {
    renderInitialCount(countEl, images, settings);
  }
};
