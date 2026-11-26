const RING_SIZE_REM = 2.5;
const RING_STROKE_WIDTH = 3;

export const initProgressRing = (): void => {
  const progressRing = document.querySelector(".progress-ring");
  const progressCircle = document.querySelector(".progress-ring__progress") as SVGCircleElement;
  if (!progressRing || !progressCircle) {
    return;
  }
  progressRing.setAttribute("role", "img");
  progressRing.setAttribute("aria-label", "Scroll progress");
  progressRing.setAttribute("focusable", "false");
  progressRing.setAttribute("tabindex", "-1");
  const rootFontSizePx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const sizePx = RING_SIZE_REM * rootFontSizePx;
  const radiusPx = sizePx / 2 - RING_STROKE_WIDTH / 2;
  progressRing.setAttribute("width", sizePx.toString());
  progressRing.setAttribute("height", sizePx.toString());
  progressRing.querySelectorAll("circle").forEach((circle) => {
    circle.setAttribute("r", radiusPx.toString());
    circle.setAttribute("cx", (sizePx / 2).toString());
    circle.setAttribute("cy", (sizePx / 2).toString());
    circle.setAttribute("stroke-width", RING_STROKE_WIDTH.toString());
  });
  const circumference = 2 * Math.PI * radiusPx;
  progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  progressCircle.style.strokeDashoffset = `${circumference}`;
  progressCircle.dataset.circumference = circumference.toString();
};
