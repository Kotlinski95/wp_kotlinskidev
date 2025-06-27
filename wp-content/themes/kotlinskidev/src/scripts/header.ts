import { debounce } from "./utils";

(function () {
  const header = document.querySelector("header");
  function adjustHeaderWidth() {
    if (header && header.clientWidth > document.body.clientWidth) {
      (header as HTMLElement).style.maxWidth = `${document.body.clientWidth}px`;
    }
  }

  adjustHeaderWidth();

  const debouncedAdjustHeaderWidth = debounce(adjustHeaderWidth, 100);
  window.addEventListener("resize", debouncedAdjustHeaderWidth);
})();
