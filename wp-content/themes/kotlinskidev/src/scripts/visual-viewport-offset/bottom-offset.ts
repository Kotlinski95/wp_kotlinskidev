const BOTTOM_OFFSET_PROPERTY = "--kt-vv-bottom-offset";
const ZOOM_THRESHOLD = 1.01;
const TEXT_ENTRY_SELECTOR =
  'textarea, select, input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"])';

const isTextEntryFocused = (): boolean => {
  const active = document.activeElement;
  return (
    active instanceof HTMLElement &&
    (active.isContentEditable || active.matches(TEXT_ENTRY_SELECTOR))
  );
};

const isKeyboardOrZoomActive = (viewport: VisualViewport): boolean =>
  viewport.scale > ZOOM_THRESHOLD || isTextEntryFocused();

export const readBottomOffset = (viewport: VisualViewport): number =>
  isKeyboardOrZoomActive(viewport)
    ? Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop))
    : 0;

export const applyBottomOffset = (offset: number): void => {
  document.documentElement.style.setProperty(BOTTOM_OFFSET_PROPERTY, `${offset}px`);
};

export const clearBottomOffset = (): void => {
  document.documentElement.style.removeProperty(BOTTOM_OFFSET_PROPERTY);
};
