import type { Instance } from "./instance";

const FALLBACK_COLOR = "#000000";

const resolveColorValue = (host: HTMLElement, rawValue: string): string => {
  if (!rawValue) {
    return FALLBACK_COLOR;
  }
  if (!rawValue.includes("var(")) {
    return rawValue;
  }

  const ownerDocument = host.ownerDocument;
  const ownerWindow = ownerDocument.defaultView ?? window;

  const probe = ownerDocument.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.color = rawValue;
  host.appendChild(probe);
  const resolved = ownerWindow.getComputedStyle(probe).color;
  host.removeChild(probe);

  return resolved || FALLBACK_COLOR;
};

export const makeResolveColor = (instance: Instance): ((value: string) => string) => {
  return (value: string) => {
    const cached = instance.colorCache.get(value);
    if (cached) {
      return cached;
    }
    const resolved = resolveColorValue(instance.host, value);
    instance.colorCache.set(value, resolved);
    return resolved;
  };
};
