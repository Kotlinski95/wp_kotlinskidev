export const IN_VIEW_HOVER_SELECTOR = [
  ".hover-jump",
  ".hover-jump-subtle",
  ".hover-jump-smooth",
  ".hover-jump-strong",
  ".hover-jump-shadow",
  ".hover-scale",
  ".hover-rotate",
  ".hover-bounce",
  ".hover-fade",
  ".hover-zoom-bg",
  ".has-hover-opacity",
  ".has-hover-bg-color",
  ".has-hover-text-color",
  ".has-hover-border",
  ".has-enhanced-hover-glow",
  ".kt-link-card",
  ".kt-pill-link",
  ".kt-post-card-grid__card",
  ".kt-image-hover-overlay",
  ".timeline-item .wp-block-group",
  ".kt-button__link",
].join(", ");

const CARD_SELECTOR = [
  ".kt-link-card",
  ".kt-post-card-grid__card",
  ".timeline-item .wp-block-group",
  ".kt-image-hover-overlay",
].join(", ");

const LINK_SELECTOR = ["a", ".kt-button__link", ".kt-pill-link", ".kt-scroll-to-top"].join(", ");

const LINK_CONTAINER_SELECTOR = [
  ".wp-block-button",
  ".wp-block-kotlinskidev-button",
  ".wp-block-navigation",
].join(", ");

export const isLinkLike = (element: Element): boolean => {
  if (element.matches(CARD_SELECTOR)) {
    return false;
  }
  return (
    element.matches(LINK_SELECTOR) ||
    element.closest(LINK_SELECTOR) !== null ||
    element.closest(LINK_CONTAINER_SELECTOR) !== null
  );
};
