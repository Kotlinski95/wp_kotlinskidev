const activeLocks = new Set<string>();

export function lockScroll(owner: string): void {
  activeLocks.add(owner);
  document.documentElement.classList.add("has-modal-open");
}

export function unlockScroll(owner: string): void {
  activeLocks.delete(owner);
  if (activeLocks.size === 0) {
    document.documentElement.classList.remove("has-modal-open");
  }
}
