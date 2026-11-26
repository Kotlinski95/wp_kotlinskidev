import { bindAnchorLinks } from "./smooth-scroll-offset/anchor-links";
import { scrollToHashTarget } from "./smooth-scroll-offset/initial-hash";

const init = (): void => {
  bindAnchorLinks();
  scrollToHashTarget();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
window.addEventListener("hashchange", scrollToHashTarget);
