export const setBody = (html: string): void => {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  document.body.replaceChildren(...Array.from(parsed.body.childNodes));
};

export const activeElement = (): Element | null => document.body.ownerDocument.activeElement;
