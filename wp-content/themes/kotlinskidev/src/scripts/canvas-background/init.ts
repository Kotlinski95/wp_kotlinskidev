import { watchDocument } from "./document-watcher";
import { watchEditorIframes } from "./editor-iframes";

// eslint-disable-next-line -- webpack's reserved runtime publicPath override identifier, not camelCase by webpack's own convention
declare let __webpack_public_path__: string;

declare global {
  interface Window {
    kotlinskidevCanvasBuildBaseUrl?: string;
  }
}

if (typeof window !== "undefined" && window.kotlinskidevCanvasBuildBaseUrl) {
  // eslint-disable-next-line -- webpack's reserved runtime publicPath override identifier, read internally by webpack's chunk loader
  __webpack_public_path__ = window.kotlinskidevCanvasBuildBaseUrl;
}

const init = (): void => {
  watchDocument(document);
  watchEditorIframes();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
