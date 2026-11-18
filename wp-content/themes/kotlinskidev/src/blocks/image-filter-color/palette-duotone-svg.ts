const SVG_SELECTOR = "svg[data-kt-palette-duotones]";
const CANVAS_SELECTOR = 'iframe[name="editor-canvas"]';

export interface PaletteDuotoneData {
  svg: string;
  labels: Record<string, string>;
}

export function injectPaletteDuotones(svg: string, target: Document | null | undefined): boolean {
  if (!svg || !target?.body || target.body.querySelector(SVG_SELECTOR)) {
    return false;
  }

  const parsed = new DOMParser().parseFromString(svg, "text/html").body.firstElementChild;
  if (!parsed) {
    return false;
  }

  target.body.prepend(target.importNode(parsed, true));

  return true;
}

function injectIntoCanvas(svg: string, canvas: HTMLIFrameElement): void {
  injectPaletteDuotones(svg, canvas.contentDocument);
}

export function watchEditorCanvas(svg: string, host: Document = document): () => void {
  if (!svg) {
    return () => undefined;
  }

  const bound = new WeakSet<HTMLIFrameElement>();

  const sync = (): void => {
    injectPaletteDuotones(svg, host);

    const canvas = host.querySelector<HTMLIFrameElement>(CANVAS_SELECTOR);
    if (!canvas || bound.has(canvas)) {
      return;
    }

    bound.add(canvas);
    canvas.addEventListener("load", () => injectIntoCanvas(svg, canvas));
    injectIntoCanvas(svg, canvas);
  };

  sync();

  const observer = new MutationObserver(sync);
  observer.observe(host.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}

export function getPaletteDuotoneData(source: unknown): PaletteDuotoneData {
  const data = (source ?? {}) as Partial<PaletteDuotoneData>;

  return {
    svg: typeof data.svg === "string" ? data.svg : "",
    labels: data.labels && typeof data.labels === "object" ? data.labels : {},
  };
}
