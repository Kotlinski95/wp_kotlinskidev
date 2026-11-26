const POINTER_EVENTS_NONE = "pointer-events:none";

const appendPointerEventsNone = (link: HTMLAnchorElement): void => {
  const style = (link.getAttribute("style") ?? "").trim();
  if (style.includes(POINTER_EVENTS_NONE)) {
    return;
  }
  const withSemicolon = style && !style.endsWith(";") ? `${style};` : style;
  link.setAttribute("style", `${withSemicolon}${POINTER_EVENTS_NONE}`);
};

export const disableCurrentLinkClick = (link: HTMLAnchorElement): void => {
  const isPanelTrigger = link.getAttribute("aria-haspopup") === "true";
  const linkNavigatesOnClick = link.closest("[data-link-navigates]") !== null;

  if (isPanelTrigger && !linkNavigatesOnClick) {
    return;
  }

  if (!isPanelTrigger) {
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("tabindex", "-1");
  }

  appendPointerEventsNone(link);
};
