export {};

const MAX_CLONE_ITERATIONS = 20;

const markClonesNonTabbable = (track: HTMLElement, realItemCount: number): void => {
  const items = Array.from(track.querySelectorAll<HTMLElement>(".kt-marquee__item"));
  items.slice(realItemCount).forEach((item) => {
    item.setAttribute("aria-hidden", "true");
    item.setAttribute("tabindex", "-1");
  });
};

const forceEagerImageLoading = (el: HTMLElement): void => {
  el.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    img.loading = "eager";
  });
};

// Seamless looping needs enough full repeats rendered that the track never runs out mid-shift — a short item list in a wide container can have one unit narrower than the container, showing a growing blank gap (matches wolanski-web.pl's own reference marquee, which repeats its set 5× for the same reason).
const appendOneUnit = (track: HTMLElement, unit: HTMLElement[]): void => {
  unit.forEach((item) => {
    track.append(item.cloneNode(true));
  });
};

interface CloneBudget {
  remaining: number;
}

// Shared across the initial measurement and every later resize top-up — a per-call cap would let total clones grow unboundedly across repeated resize events.
const growUntilWideEnough = (
  track: HTMLElement,
  unit: HTMLElement[],
  shiftDistance: number,
  containerWidth: number,
  budget: CloneBudget
): void => {
  while (
    shiftDistance > 0 &&
    track.scrollWidth < shiftDistance + containerWidth &&
    budget.remaining > 0
  ) {
    appendOneUnit(track, unit);
    budget.remaining -= 1;
  }
};

const ensureSeamlessLoop = (
  track: HTMLElement,
  container: HTMLElement,
  budget: CloneBudget
): number => {
  const realItems = Array.from(track.children) as HTMLElement[];
  const realItemCount = realItems.length;
  if (realItemCount === 0) {
    return 0;
  }

  appendOneUnit(track, realItems);
  const secondUnitFirstChild = track.children[realItemCount] as HTMLElement;
  const shiftDistance = Math.round(
    secondUnitFirstChild.getBoundingClientRect().left - track.getBoundingClientRect().left
  );

  growUntilWideEnough(track, realItems, shiftDistance, container.clientWidth, budget);

  return shiftDistance;
};

const wireMarqueePauseResume = (container: HTMLElement, track: HTMLElement): void => {
  let hovered = false;
  let focused = false;
  let pressed = false;
  let modalOpen = false;
  let isPaused = false;

  const evaluate = () => {
    const shouldPause = hovered || focused || pressed || modalOpen;
    if (shouldPause === isPaused) {
      return;
    }
    isPaused = shouldPause;
    track.classList.toggle("is-paused", isPaused);
  };

  container.addEventListener("mouseenter", () => {
    hovered = true;
    evaluate();
  });

  container.addEventListener("mouseleave", () => {
    hovered = false;
    evaluate();
  });

  container.addEventListener("focusin", () => {
    focused = true;
    evaluate();
  });

  container.addEventListener("focusout", (event) => {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement instanceof Node && container.contains(nextFocusedElement)) {
      return;
    }
    focused = false;
    evaluate();
  });

  container.addEventListener("pointerdown", () => {
    pressed = true;
    evaluate();
  });

  const releasePress = () => {
    if (!pressed) {
      return;
    }
    pressed = false;
    evaluate();
  };
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("pointercancel", releasePress);

  document.addEventListener("kt-modal:open", (event) => {
    const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
    if (!trigger || !container.contains(trigger)) {
      return;
    }
    modalOpen = true;
    evaluate();
  });

  document.addEventListener("kt-modal:close", (event) => {
    const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
    if (!trigger || !container.contains(trigger)) {
      return;
    }
    modalOpen = false;
    // modal-manager.ts refocuses the trigger before dispatching this event, which would otherwise leave `focused` stuck true forever (no focusout ever comes) and permanently block the resume below.
    focused = false;
    evaluate();
  });

  // Defense-in-depth: resume on scroll if paused with no genuine reason left — doesn't override a real ongoing hover or press.
  window.addEventListener(
    "scroll",
    () => {
      if (isPaused && !hovered && !pressed && !modalOpen) {
        focused = false;
        evaluate();
      }
    },
    { passive: true }
  );
};

const initMarquee = (el: HTMLElement): void => {
  const track = el.querySelector<HTMLElement>(".kt-marquee__track");
  if (!track) {
    return;
  }
  const realItemCount = track.children.length;
  const cloneBudget: CloneBudget = { remaining: MAX_CLONE_ITERATIONS };
  const shiftDistance = ensureSeamlessLoop(track, el, cloneBudget);
  if (shiftDistance > 0) {
    track.style.setProperty("--kt-marquee-shift", `-${shiftDistance}px`);
  }
  markClonesNonTabbable(track, realItemCount);
  forceEagerImageLoading(el);
  wireMarqueePauseResume(el, track);

  if (typeof ResizeObserver === "undefined") {
    return;
  }
  const realItems = Array.from(track.children).slice(0, realItemCount) as HTMLElement[];
  const observer = new ResizeObserver(() => {
    const beforeCount = track.children.length;
    growUntilWideEnough(track, realItems, shiftDistance, el.clientWidth, cloneBudget);
    if (track.children.length !== beforeCount) {
      markClonesNonTabbable(track, realItemCount);
      forceEagerImageLoading(el);
    }
  });
  observer.observe(el);
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>(".kt-marquee").forEach(initMarquee);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
