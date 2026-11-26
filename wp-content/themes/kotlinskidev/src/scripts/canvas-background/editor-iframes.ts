import { watchDocument } from "./document-watcher";

const EDITOR_IFRAME_SELECTOR = "iframe[name='editor-canvas']";

const watchIframeDocument = (iframe: HTMLIFrameElement): void => {
  const doc = iframe.contentDocument;
  if (doc && doc.body) {
    watchDocument(doc);
  }
};

export const watchEditorIframes = (): void => {
  const iframesWithLoadListener = new WeakSet<HTMLIFrameElement>();

  const attach = (iframe: HTMLIFrameElement): void => {
    watchIframeDocument(iframe);

    if (iframesWithLoadListener.has(iframe)) {
      return;
    }
    iframesWithLoadListener.add(iframe);

    iframe.addEventListener("load", () => watchIframeDocument(iframe));
  };

  document.querySelectorAll<HTMLIFrameElement>(EDITOR_IFRAME_SELECTOR).forEach(attach);

  const bodyObserver = new MutationObserver(() => {
    document.querySelectorAll<HTMLIFrameElement>(EDITOR_IFRAME_SELECTOR).forEach(attach);
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });
};
