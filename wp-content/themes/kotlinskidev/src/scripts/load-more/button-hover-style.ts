export const applyButtonHoverStyle = (button: HTMLButtonElement, dataset: DOMStringMap): void => {
  const { ktLoadMoreHoverTextColor, ktLoadMoreHoverBgColor, ktLoadMoreHoverBorderColor } = dataset;

  if (!ktLoadMoreHoverTextColor && !ktLoadMoreHoverBgColor && !ktLoadMoreHoverBorderColor) {
    return;
  }

  const baseColor = button.style.color;
  const baseBackground = button.style.background;
  const baseBorderColor = button.style.borderColor;

  const setHoverStyle = () => {
    if (ktLoadMoreHoverTextColor) {
      button.style.color = ktLoadMoreHoverTextColor;
    }
    if (ktLoadMoreHoverBgColor) {
      button.style.background = ktLoadMoreHoverBgColor;
    }
    if (ktLoadMoreHoverBorderColor) {
      button.style.borderColor = ktLoadMoreHoverBorderColor;
    }
  };

  const resetStyle = () => {
    button.style.color = baseColor;
    button.style.background = baseBackground;
    button.style.borderColor = baseBorderColor;
  };

  button.addEventListener("mouseenter", setHoverStyle);
  button.addEventListener("mouseleave", resetStyle);
  button.addEventListener("focus", setHoverStyle);
  button.addEventListener("blur", resetStyle);
};
