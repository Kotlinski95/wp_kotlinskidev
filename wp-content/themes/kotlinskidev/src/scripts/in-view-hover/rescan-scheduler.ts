const RESCAN_DEBOUNCE_MS = 150;

export interface RescanScheduler {
  schedule: () => void;
  cancel: () => void;
}

export const createRescanScheduler = (rescan: () => void): RescanScheduler => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const schedule = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      rescan();
    }, RESCAN_DEBOUNCE_MS);
  };

  return { schedule, cancel };
};
