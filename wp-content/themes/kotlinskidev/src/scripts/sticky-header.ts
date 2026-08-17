import { getScrollTop, onScroll } from "./utils";

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector("header") as HTMLElement | null;
  if (!header) {
    return;
  }

  const breadcrumbs = document.querySelector(".kt-breadcrumbs") as HTMLElement | null;

  const stickyThreshold = 30;
  let rafId: number | null = null;

  const handleScroll = () => {
    if (rafId !== null) {
      return;
    }
    rafId = requestAnimationFrame(() => {
      const scrolled = getScrollTop() > stickyThreshold;
      header.classList.toggle("header-sticky", scrolled);
      breadcrumbs?.classList.toggle("kt-breadcrumbs--hidden", scrolled);
      rafId = null;
    });
  };

  handleScroll();
  onScroll(handleScroll);
});
