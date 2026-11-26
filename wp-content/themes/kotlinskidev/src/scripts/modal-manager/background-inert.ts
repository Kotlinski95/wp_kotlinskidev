export const setBackgroundInert = (modal: HTMLElement, isInert: boolean): void => {
  Array.from(document.body.children).forEach((el) => {
    if (el === modal) {
      return;
    }
    if (isInert) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  });
};
