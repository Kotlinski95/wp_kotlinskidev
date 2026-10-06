export const NAV_PANEL_OPEN_EVENT = "kt:nav-panel-open";
export const NAV_PANEL_CLOSE_EVENT = "kt:nav-panel-close";

export interface NavPanelEventDetail {
  container: HTMLElement;
}

export function dispatchNavPanelOpen(container: HTMLElement): void {
  document.dispatchEvent(
    new CustomEvent<NavPanelEventDetail>(NAV_PANEL_OPEN_EVENT, { detail: { container } })
  );
}

export function dispatchNavPanelClose(container: HTMLElement): void {
  document.dispatchEvent(
    new CustomEvent<NavPanelEventDetail>(NAV_PANEL_CLOSE_EVENT, { detail: { container } })
  );
}
