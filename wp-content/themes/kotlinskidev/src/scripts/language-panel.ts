import { initDropdownPanels } from "@utils/dropdown-panel";

document.addEventListener("DOMContentLoaded", () => {
  initDropdownPanels({
    rootSelector: ".kt-lang-panel",
    triggerSelector: ".kt-lang-panel__trigger",
    modalSelector: ".kt-lang-panel__modal",
  });
});
