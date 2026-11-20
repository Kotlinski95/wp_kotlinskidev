import "@utils/webpack-public-path";
import { decryptText } from "./protected-content/decrypt-api";
import {
  observeDOM,
  observeElement,
  processProtectedElements,
} from "./protected-content/element-observers";
import { observeCopyButtons } from "./protected-content/interaction-listeners";

const initProtection = (): void => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processProtectedElements);
  } else {
    processProtectedElements();
  }

  observeDOM();
  observeCopyButtons();
};

const kotlinskidevProtection = {
  decryptText,
  processProtectedElements,
  processElement: observeElement,
  initProtection,
};

initProtection();

window.kotlinskidevProtection = kotlinskidevProtection;
