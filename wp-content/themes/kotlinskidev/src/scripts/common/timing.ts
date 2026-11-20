export const debounce = <Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number,
  immediate = false
): ((...args: Args) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args) => {
    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    }, wait);

    if (callNow) {
      func(...args);
    }
  };
};

export const throttle = <Args extends unknown[]>(
  func: (...args: Args) => void,
  limit: number
): ((...args: Args) => void) => {
  let inThrottle = false;

  return (...args: Args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
