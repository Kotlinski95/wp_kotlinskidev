import { animateDetails } from "./faq-accordion/animate-details";
import { splitIntoIndependentColumns } from "./faq-accordion/independent-columns";

const SUMMARY_SELECTOR = ".wp-block-details > summary";

const bindSummary = (summary: HTMLElement): void => {
  const details = summary.parentElement;
  if (!(details instanceof HTMLDetailsElement)) {
    return;
  }

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    animateDetails(details, summary);
  });
};

const init = (): void => {
  splitIntoIndependentColumns();
  document.querySelectorAll<HTMLElement>(SUMMARY_SELECTOR).forEach(bindSummary);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
