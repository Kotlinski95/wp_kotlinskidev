import { applyResponsiveVideo, watchDevice } from "@utils/responsive-media";

const bindVideo = (video: HTMLVideoElement): void => {
  const update = () => applyResponsiveVideo(video);

  watchDevice(update);
  update();
};

export const initResponsiveMedia = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLVideoElement>("video[data-kt-src-desktop]").forEach(bindVideo);
};

initResponsiveMedia();
