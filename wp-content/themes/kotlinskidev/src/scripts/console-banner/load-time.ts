import { LOAD_TIME_STYLE } from "./banner-styles";
import { logStyled } from "./styled-log";

function logLoadTime(): void {
  const [navigation] = window.performance.getEntriesByType("navigation") as
    | PerformanceNavigationTiming[]
    | [];
  if (!navigation || navigation.loadEventEnd <= 0) {
    return;
  }
  logStyled(`⚡ Site loaded in ${Math.round(navigation.loadEventEnd)}ms`, LOAD_TIME_STYLE);
}

export function scheduleLoadTimeLog(): void {
  if (typeof window.performance?.getEntriesByType !== "function") {
    return;
  }
  if (document.readyState === "complete") {
    window.setTimeout(logLoadTime, 0);
  } else {
    window.addEventListener("load", () => window.setTimeout(logLoadTime, 0), { once: true });
  }
}
