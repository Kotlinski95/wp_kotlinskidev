export type ModalTriggerEventName = "kt-modal:open" | "kt-modal:close";

interface ModalTriggerEventDetail {
  trigger?: HTMLElement;
}

export function onModalTriggerInside(
  container: HTMLElement,
  eventName: ModalTriggerEventName,
  handler: () => void
): void {
  document.addEventListener(eventName, (event) => {
    const trigger = (event as CustomEvent<ModalTriggerEventDetail>).detail?.trigger;
    if (!trigger || !container.contains(trigger)) {
      return;
    }
    handler();
  });
}
