export interface GlowTarget {
  listenEl: HTMLElement;
  paintEl: HTMLElement;
}

const GLOW_CLASS = ".has-enhanced-hover-glow";
const EXCLUDED_FROM_GENERIC_TARGETS =
  ":not(.kt-button__link):not(.kt-button):not(.wp-block-button):not(.wp-block-kotlinskidev-content-tabs-nav-link)";

const closestNonInlineAncestor = (el: HTMLElement): HTMLElement => {
  let node = el.parentElement;

  while (node && getComputedStyle(node).display === "inline") {
    node = node.parentElement;
  }

  return node ?? el;
};

const collectLabelledTargets = (
  linkSelector: string,
  labelSelector: string,
  into: GlowTarget[]
): void => {
  document.querySelectorAll<HTMLElement>(linkSelector).forEach((link) => {
    const label = link.querySelector<HTMLElement>(labelSelector);
    if (label) {
      into.push({ listenEl: link, paintEl: label });
    }
  });
};

export const collectGlowTargets = (): GlowTarget[] => {
  const targets: GlowTarget[] = [];

  collectLabelledTargets(`.kt-button__link${GLOW_CLASS}`, ".kt-button__label", targets);

  document
    .querySelectorAll<HTMLElement>(`${GLOW_CLASS} .wp-block-button__link`)
    .forEach((link) => targets.push({ listenEl: link, paintEl: link }));

  collectLabelledTargets(
    `.wp-block-kotlinskidev-content-tabs-nav-link${GLOW_CLASS}`,
    ".kt-content-tabs-nav-link__label",
    targets
  );

  document
    .querySelectorAll<HTMLElement>(`${GLOW_CLASS}${EXCLUDED_FROM_GENERIC_TARGETS}`)
    .forEach((el) => targets.push({ listenEl: closestNonInlineAncestor(el), paintEl: el }));

  return targets;
};
