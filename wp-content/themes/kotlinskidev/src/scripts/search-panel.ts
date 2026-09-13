import { initDropdownPanels } from "@utils/dropdown-panel";
import { trackEvent } from "./track-event";

document.addEventListener("DOMContentLoaded", () => {
  initDropdownPanels({
    rootSelector: ".kt-search-panel",
    triggerSelector: ".kt-search-panel__trigger",
    modalSelector: ".kt-search-panel__modal",
    onOpen: (modal) => {
      modal.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      trackEvent("search_panel_open");
    },
  });
});
