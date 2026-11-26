export interface SourceContext {
  imgProps: [string, string][];
  figureProps: [string, string][];
  figureStyleClasses: string[];
}

const STYLE_CLASS_PREFIX = "is-style-";

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

const captureContext = (figure: HTMLElement): SourceContext => ({
  imgProps: parseCssProps(figure.querySelector<HTMLImageElement>("img")?.style.cssText ?? ""),
  figureProps: parseCssProps(figure.style.cssText),
  figureStyleClasses: Array.from(figure.classList).filter((c) => c.startsWith(STYLE_CLASS_PREFIX)),
});

export const rememberPendingContext = (figure: HTMLElement): void => {
  pendingContext = captureContext(figure);
};

export const forgetPendingContext = (): void => {
  pendingContext = null;
};

export const takePendingContext = (): SourceContext | null => pendingContext;

export const applyContext = (
  overlay: HTMLElement,
  ctx: SourceContext,
  enlargedContainer: HTMLElement
): void => {
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

export const clearContext = (overlay: HTMLElement): void => {
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
