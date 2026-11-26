interface KotlinskidevA11yApi {
  api: number;
  open: (opener?: HTMLElement | null) => void;
  toggle: (target?: string, opener?: HTMLElement | null) => void;
}

declare global {
  interface Window {
    kotlinskidevA11y?: KotlinskidevA11yApi;
  }
}

const getToggle = (root: HTMLElement): HTMLElement | null =>
  root.querySelector<HTMLElement>(".kt-speed-dial__toggle");

export const attachA11yBridge = (onHandled: (root: HTMLElement) => void): (() => void) => {
  let pendingOpener: HTMLElement | null = null;

  const onClick = (event: MouseEvent): void => {
    const trigger = (event.target as Element).closest<HTMLElement>("[data-kt-speed-dial-a11y]");
    const root = trigger?.closest<HTMLElement>("[data-kt-speed-dial]");
    const toggle = root ? getToggle(root) : null;
    if (!trigger || !root || !toggle) {
      return;
    }
    const api = window.kotlinskidevA11y;
    if (api?.api !== 1) {
      pendingOpener = toggle;
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const action = trigger.dataset.ktSpeedDialA11y;
    if (action === "open") {
      api.open(toggle);
    } else {
      api.toggle(action, toggle);
    }
    onHandled(root);
  };

  const onPanelClose = (): void => {
    const opener = pendingOpener;
    pendingOpener = null;
    if (!opener) {
      return;
    }
    const active = opener.ownerDocument.activeElement;
    if (!active || active === document.body || active.closest("[hidden]")) {
      opener.focus();
    }
  };

  window.addEventListener("click", onClick, true);
  document.addEventListener("ka11y:close", onPanelClose);
  return () => {
    window.removeEventListener("click", onClick, true);
    document.removeEventListener("ka11y:close", onPanelClose);
  };
};
