import type { HeroSwiper } from "./hero-swiper";

type NavigationAction = "prev" | "next" | number;

export interface PendingNavigation {
  actions: NavigationAction[];
  stop: () => void;
}

const resolveNavigationAction = (target: Element): NavigationAction | null => {
  if (target.closest(".swiper-button-prev")) {
    return "prev";
  }
  if (target.closest(".swiper-button-next")) {
    return "next";
  }
  const bullet = target.closest(".swiper-pagination-bullet");
  if (bullet?.parentElement) {
    return Array.prototype.indexOf.call(bullet.parentElement.children, bullet);
  }
  return null;
};

export const capturePendingNavigation = (el: HTMLElement): PendingNavigation => {
  const container = el.closest<HTMLElement>(".hero-carousel") ?? el;
  const actions: NavigationAction[] = [];
  const onClick = (event: Event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const action = resolveNavigationAction(event.target);
    if (action !== null) {
      actions.push(action);
    }
  };
  container.addEventListener("click", onClick);
  return { actions, stop: () => container.removeEventListener("click", onClick) };
};

export const replayNavigation = (swiper: HeroSwiper, actions: NavigationAction[]): void => {
  actions.forEach((action) => {
    if (action === "prev") {
      swiper.slidePrev();
    } else if (action === "next") {
      swiper.slideNext();
    } else {
      swiper.slideTo(action);
    }
  });
};
