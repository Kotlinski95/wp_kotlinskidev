import type { VoidCallback } from "./types";

type ElementProperties<K extends keyof HTMLElementTagNameMap> = Partial<HTMLElementTagNameMap[K]> &
  Record<string, unknown>;

export const formatString = (str: string, ...args: (string | number)[]): string => {
  return str.replace(/%(\d+)\$?[sd]/g, (match, index) => {
    const argIndex = Number.parseInt(index) - 1;
    return args[argIndex]?.toString() || match;
  });
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes: ElementProperties<K> = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith("data-") || key.startsWith("aria-")) {
      element.setAttribute(key, String(value));
    } else if (key in element) {
      (element as unknown as Record<string, unknown>)[key] = value;
    }
  });

  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
};

export const domReady = (callback: VoidCallback): void => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};
