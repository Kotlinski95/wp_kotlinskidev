const SWAPPED_ATTRIBUTES = ["src", "srcset", "sizes"] as const;

export const loadDeferredImage = (img: HTMLImageElement): void => {
  SWAPPED_ATTRIBUTES.forEach((name) => {
    const value = img.getAttribute(`data-${name}`);
    if (value) {
      img.setAttribute(name, value);
    }
    img.removeAttribute(`data-${name}`);
  });
};

export const loadDeferredImages = (root: ParentNode): void => {
  root.querySelectorAll<HTMLImageElement>("img[data-src]").forEach(loadDeferredImage);
};
