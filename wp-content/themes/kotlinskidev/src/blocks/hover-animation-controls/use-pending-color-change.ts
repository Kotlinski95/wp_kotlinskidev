import { useRef } from "react";
import type { HoverAnimationAttributes } from "./hover-attributes";

type ColorAttribute = "hoverBackgroundColor" | "hoverTextColor";

export const usePendingColorChange = (
  attribute: ColorAttribute,
  setAttributes: (attributes: Partial<HoverAnimationAttributes>) => void
): ((value: string | undefined) => void) => {
  const pendingColorRef = useRef<string | null>(null);

  return (value) => {
    if (value !== undefined) {
      pendingColorRef.current = value;
      setAttributes({ [attribute]: value });
    } else if (pendingColorRef.current !== null) {
      pendingColorRef.current = null;
    } else {
      setAttributes({ [attribute]: "" });
    }
  };
};
