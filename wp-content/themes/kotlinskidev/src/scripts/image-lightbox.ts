import { attachImageZoom } from "@utils/zoom/attachImageZoom";

(() => {
  const isTouchDevice = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  interface SourceContext {
    imgProps: [string, string][];
    figureProps: [string, string][];
    figureStyleClasses: string[];
  }

  let currentZoomTeardown: (() => void) | null = null;
  let pendingContext: SourceContext | null = null;
  let activeContext: SourceContext | null = null;
  let activeEnlargedImg: HTMLImageElement | null = null;

  const parseCssProps = (cssText: string): [string, string][] => {
    const el = document.createElement("div");
    el.style.cssText = cssText;
    const props: [string, string][] = [];
    for (let i = 0; i < el.style.length; i++) {
      const prop = el.style[i];
      props.push([prop, el.style.getPropertyValue(prop)]);
    }
    return props;
  };

  const blockOverlayClickHandler = (e: MouseEvent) => {
    const target = e.target as Element;
    if (
      !target.closest(".wp-lightbox-close-button") &&
      !target.closest(".close-button") &&
      !target.closest(".lightbox-image-container")
    ) {
      e.stopImmediatePropagation();
    }
  };

  const captureContext = (figure: HTMLElement): SourceContext => ({
    imgProps: parseCssProps(figure.querySelector<HTMLImageElement>("img")?.style.cssText ?? ""),
    figureProps: parseCssProps(figure.style.cssText),
    figureStyleClasses: Array.from(figure.classList).filter((c) => c.startsWith("is-style-")),
  });

  const applyContext = (
    overlay: HTMLElement,
    ctx: SourceContext,
    enlargedContainer: HTMLElement
  ) => {
    activeContext = ctx;

    const img = enlargedContainer.querySelector<HTMLImageElement>("img");
    activeEnlargedImg = img;
    if (img) {
      ctx.imgProps.forEach(([prop, val]) => img.style.setProperty(prop, val));
      img.style.objectFit = "cover";
    }

    const lightboxFigure = overlay.querySelector<HTMLElement>("figure");
    if (lightboxFigure) {
      ctx.figureProps.forEach(([prop, val]) => lightboxFigure.style.setProperty(prop, val));
      ctx.figureStyleClasses.forEach((cls) => lightboxFigure.classList.add(cls));
    }
  };

  const clearContext = (overlay: HTMLElement) => {
    const ctx = activeContext;
    activeContext = null;

    const img = activeEnlargedImg;
    activeEnlargedImg = null;
    if (img) {
      ctx?.imgProps.forEach(([prop]) => img.style.removeProperty(prop));
      img.style.removeProperty("object-fit");
    }

    const lightboxFigure = overlay.querySelector<HTMLElement>("figure");
    if (lightboxFigure) {
      ctx?.figureProps.forEach(([prop]) => lightboxFigure.style.removeProperty(prop));
      ctx?.figureStyleClasses.forEach((cls) => lightboxFigure.classList.remove(cls));
    }
  };

  const setupLightbox = (overlay: HTMLElement) => {
    overlay.addEventListener("click", blockOverlayClickHandler, true);
    if (isTouchDevice()) overlay.style.touchAction = "none";

    const containers = overlay.querySelectorAll<HTMLElement>(".lightbox-image-container");
    const thumbnailContainer = containers[0];
    const enlargedContainer = containers[1];

    if (thumbnailContainer) thumbnailContainer.style.display = "none";
    if (enlargedContainer) {
      currentZoomTeardown = attachImageZoom(enlargedContainer);
      if (pendingContext) applyContext(overlay, pendingContext, enlargedContainer);
    }

    pendingContext = null;
  };

  const teardownLightbox = (overlay: HTMLElement) => {
    overlay.removeEventListener("click", blockOverlayClickHandler, true);
    overlay.style.touchAction = "";

    currentZoomTeardown?.();
    currentZoomTeardown = null;

    const containers = overlay.querySelectorAll<HTMLElement>(".lightbox-image-container");
    if (containers[0]) containers[0].style.display = "";

    const onDone = () => {
      clearTimeout(fallback);
      overlay.removeEventListener("transitionend", onTransitionEnd);
      clearContext(overlay);
    };
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== overlay) return;
      onDone();
    };
    const fallback = setTimeout(onDone, 500);
    overlay.addEventListener("transitionend", onTransitionEnd);
  };

  const initLightbox = () => {
    const lightboxOverlay = document.querySelector<HTMLElement>(".wp-lightbox-overlay");
    if (!lightboxOverlay) return;

    document.addEventListener(
      "pointerdown",
      () => {
        pendingContext = null;
      },
      true
    );

    document.querySelectorAll<HTMLElement>(".wp-block-image").forEach((figure) => {
      figure.addEventListener("click", () => {
        pendingContext = captureContext(figure);
      });
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const overlay = mutation.target as HTMLElement;
        if (overlay.classList.contains("active")) {
          setupLightbox(overlay);
        } else {
          teardownLightbox(overlay);
        }
      });
    });

    observer.observe(lightboxOverlay, { attributes: true, attributeFilter: ["class"] });

    if (lightboxOverlay.classList.contains("active")) {
      setupLightbox(lightboxOverlay);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLightbox);
  } else {
    initLightbox();
  }
})();
