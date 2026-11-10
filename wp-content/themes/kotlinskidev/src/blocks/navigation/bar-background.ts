export interface PaletteColor {
  name: string;
  slug: string;
  color: string;
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const barBackgroundToColor = (
  value: string,
  palette: PaletteColor[]
): string | undefined => {
  if (!value) {
    return undefined;
  }
  const match = palette.find((entry) => entry.slug === value);
  if (match) {
    return match.color;
  }
  return SLUG_PATTERN.test(value) ? undefined : value;
};

export const colorToBarBackground = (
  color: string | undefined,
  palette: PaletteColor[]
): string => {
  if (!color) {
    return "";
  }
  const match = palette.find((entry) => entry.color === color);
  return match ? match.slug : color;
};
