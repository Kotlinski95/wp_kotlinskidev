import { watchForTransformChange } from "./gsap-sticky";

function initFooterTransformSync(): void {
  const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper");
  const footer = document.querySelector<HTMLElement>(".kotlinskidev-footer");
  if (!pageWrapper || !footer || !document.querySelector(".scroll-section")) {
    return;
  }

  watchForTransformChange(pageWrapper, () => {
    footer.style.transform = pageWrapper.style.transform;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterTransformSync);
} else {
  initFooterTransformSync();
}
