import { onActivateScrollToTop } from "./activate-scroll-to-top";

export const bindBarTriggers = (): void => {
  document.querySelectorAll(".kt-scroll-to-top__trigger").forEach((trigger) => {
    trigger.addEventListener("click", onActivateScrollToTop);
  });
};
