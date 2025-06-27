export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
) {
  let timeout: number | undefined;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}
