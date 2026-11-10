const IOS_PATTERN = /iPhone|iPad|iPod/;
const NON_SAFARI_ENGINE_PATTERN = /Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg\/|Android|OPR\//;

export function isWebKitBrowser(
  userAgent: string = navigator.userAgent,
  maxTouchPoints: number = navigator.maxTouchPoints
): boolean {
  if (IOS_PATTERN.test(userAgent)) {
    return true;
  }
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) {
    return true;
  }
  return /Safari\//.test(userAgent) && !NON_SAFARI_ENGINE_PATTERN.test(userAgent);
}

export function isIosWebKit(
  userAgent: string = navigator.userAgent,
  maxTouchPoints: number = navigator.maxTouchPoints
): boolean {
  if (IOS_PATTERN.test(userAgent)) {
    return true;
  }
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}
