const CARD_SELECTOR = ".kt-article-card, .kt-project-card";
const CARD_STAGGER_MS = 80;
const FADE_HEIGHT_RELEASE_MS = 300;

export interface PanelSwitch {
  oldPanel: HTMLElement | undefined;
  newPanel: HTMLElement;
  cardAnimation: string;
}

function revealCards(panel: HTMLElement, cardAnimation: string): void {
  if ("fade-up" !== cardAnimation) {
    return;
  }

  const cards = Array.from(panel.querySelectorAll<HTMLElement>(CARD_SELECTOR));

  cards.forEach((card, index) => {
    card.classList.remove("visible");
    card.classList.add("fade-up-on-scroll");
    card.style.transitionDelay = `${index * CARD_STAGGER_MS}ms`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cards.forEach((card) => card.classList.add("visible"));
    });
  });
}

export function swapPanels({ oldPanel, newPanel, cardAnimation }: PanelSwitch): void {
  oldPanel?.setAttribute("hidden", "");
  newPanel.removeAttribute("hidden");
  revealCards(newPanel, cardAnimation);
}

export function fadeToPanel(panelsWrapper: HTMLElement, panelSwitch: PanelSwitch): void {
  const { oldPanel, newPanel } = panelSwitch;
  if (!oldPanel || oldPanel === newPanel) {
    swapPanels(panelSwitch);
    return;
  }

  const frozenHeight = panelsWrapper.getBoundingClientRect().height;
  panelsWrapper.style.minHeight = `${frozenHeight}px`;

  const finishFadeOut = (): void => {
    oldPanel.removeEventListener("transitionend", finishFadeOut);
    oldPanel.classList.remove("kt-content-tabs__panel--fade-out");
    swapPanels(panelSwitch);

    newPanel.classList.add("kt-content-tabs__panel--fade-out");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newPanel.classList.remove("kt-content-tabs__panel--fade-out");
      });
    });

    window.setTimeout(() => {
      panelsWrapper.style.minHeight = "";
    }, FADE_HEIGHT_RELEASE_MS);
  };

  oldPanel.addEventListener("transitionend", finishFadeOut, { once: true });
  oldPanel.classList.add("kt-content-tabs__panel--fade-out");
}
