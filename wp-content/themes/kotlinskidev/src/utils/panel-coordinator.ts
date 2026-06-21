type CloseHandler = () => void;

const registry = new Set<CloseHandler>();

export function registerPanel(close: CloseHandler): void {
  registry.add(close);
}

export function closeAllExcept(current?: CloseHandler): void {
  registry.forEach((close) => {
    if (close !== current) close();
  });
}
