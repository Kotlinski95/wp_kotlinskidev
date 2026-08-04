(function () {
  const ANIMATION_DURATION = 350;
  const ANIMATION_EASING = "ease-in-out";
  const ANIMATING_CLASS = "kt-details-animating";

  const prefersReducedMotion = (): boolean =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const measureTransition = (
    details: HTMLDetailsElement,
    summary: HTMLElement,
    targetOpen: boolean
  ) => {
    const startHeight = details.getBoundingClientRect().height;
    const startMargin = getComputedStyle(summary).marginBottom;
    details.open = targetOpen;
    const endHeight = details.getBoundingClientRect().height;
    const endMargin = getComputedStyle(summary).marginBottom;
    return { startHeight, endHeight, startMargin, endMargin };
  };

  const animateDetails = (details: HTMLDetailsElement, summary: HTMLElement): void => {
    if (details.classList.contains(ANIMATING_CLASS)) {
      return;
    }

    const isOpen = details.hasAttribute("open");

    if (prefersReducedMotion()) {
      details.open = !isOpen;
      return;
    }

    details.classList.add(ANIMATING_CLASS);

    const finish = (setOpen: boolean) => {
      details.open = setOpen;
      details.classList.remove(ANIMATING_CLASS);
      details.style.height = "";
    };

    const { startHeight, endHeight, startMargin, endMargin } = measureTransition(
      details,
      summary,
      !isOpen
    );

    if (isOpen) {
      details.open = true;
    }

    const animation = details.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: ANIMATION_DURATION, easing: ANIMATION_EASING }
    );
    summary.animate([{ marginBottom: startMargin }, { marginBottom: endMargin }], {
      duration: ANIMATION_DURATION,
      easing: ANIMATION_EASING,
    });
    animation.onfinish = () => finish(!isOpen);
  };

  const INDEPENDENT_COLUMNS_CLASS = "kt-faq-independent-columns";

  const getIndependentColumnsCount = (group: Element): number | null => {
    for (const className of Array.from(group.classList)) {
      if (className === INDEPENDENT_COLUMNS_CLASS) {
        return 2;
      }
      const match = className.match(/^kt-faq-independent-columns-(\d+)$/);
      if (match) {
        return Number(match[1]);
      }
    }
    return null;
  };

  const splitIntoIndependentColumns = (): void => {
    const groups = document.querySelectorAll(
      `.${INDEPENDENT_COLUMNS_CLASS}, [class*="${INDEPENDENT_COLUMNS_CLASS}-"]`
    );

    groups.forEach((group) => {
      const columnCount = getIndependentColumnsCount(group);
      if (!columnCount) {
        return;
      }

      const items = Array.from(group.children).filter(
        (el): el is HTMLDetailsElement => el instanceof HTMLDetailsElement
      );
      if (items.length === 0) {
        return;
      }

      const columns: HTMLDivElement[] = [];
      for (let i = 0; i < columnCount; i++) {
        const column = document.createElement("div");
        column.className = "kt-faq-column";
        columns.push(column);
        group.appendChild(column);
      }

      const itemsPerColumn = Math.ceil(items.length / columnCount);
      items.forEach((item, index) => {
        const columnIndex = Math.min(Math.floor(index / itemsPerColumn), columnCount - 1);
        columns[columnIndex].appendChild(item);
      });
    });
  };

  const init = (): void => {
    splitIntoIndependentColumns();

    const summaries = document.querySelectorAll<HTMLElement>(".wp-block-details > summary");

    summaries.forEach((summary) => {
      const details = summary.parentElement;
      if (!(details instanceof HTMLDetailsElement)) {
        return;
      }

      summary.addEventListener("click", (event) => {
        event.preventDefault();
        animateDetails(details, summary);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
