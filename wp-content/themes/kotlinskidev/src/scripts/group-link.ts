const GROUP_LINK_SELECTOR = ".kt-group-link";
const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [contenteditable="true"], [role="button"]';

const closestInteractive = (target: EventTarget | null): Element | null => {
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest(INTERACTIVE_SELECTOR);
};

const isRealLink = (group: HTMLElement): boolean =>
  group.tagName === "A" && group.hasAttribute("href");

const blockNestedInteractiveNavigation = (group: HTMLElement): void => {
  group.addEventListener("click", (event) => {
    const interactive = closestInteractive(event.target);
    if (interactive && interactive !== group) {
      event.preventDefault();
    }
  });
};

const navigateTo = (group: HTMLElement, url: string): void => {
  if (group.dataset.ktGroupLinkTarget === "_blank") {
    window.open(url, "_blank", "noopener");
  } else {
    window.open(url, "_self");
  }
};

const makeGroupNavigate = (group: HTMLElement, url: string): void => {
  group.addEventListener("click", (event) => {
    if (closestInteractive(event.target)) {
      return;
    }
    navigateTo(group, url);
  });

  group.addEventListener("keydown", (event) => {
    if (event.target !== group) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateTo(group, url);
    }
  });
};

const bindGroupLink = (group: HTMLElement): void => {
  if (isRealLink(group)) {
    blockNestedInteractiveNavigation(group);
    return;
  }

  const url = group.dataset.ktGroupLinkUrl;
  if (!url) {
    return;
  }
  makeGroupNavigate(group, url);
};

const initGroupLinks = (): void => {
  document.querySelectorAll<HTMLElement>(GROUP_LINK_SELECTOR).forEach(bindGroupLink);
};

initGroupLinks();
