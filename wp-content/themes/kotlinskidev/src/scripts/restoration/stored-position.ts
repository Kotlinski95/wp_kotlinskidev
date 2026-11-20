const STORAGE_KEY_PREFIX = "kt-scroll:";

const storageKey = (): string =>
  `${STORAGE_KEY_PREFIX}${window.location.pathname}${window.location.search}`;

export const readStoredPosition = (): number | null => {
  try {
    const raw = sessionStorage.getItem(storageKey());
    if (raw === null) {
      return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
};

export const writeStoredPosition = (position: number): boolean => {
  try {
    sessionStorage.setItem(storageKey(), `${position}`);
    return true;
  } catch {
    return false;
  }
};
