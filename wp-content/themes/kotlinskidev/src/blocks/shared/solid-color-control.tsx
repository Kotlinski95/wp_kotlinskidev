import React from "react";
import { __experimentalColorGradientControl as ColorGradientControl } from "@wordpress/block-editor";

interface SolidColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  clearable?: boolean;
}

export function SolidColorControl({
  label,
  value,
  onChange,
  clearable = true,
}: SolidColorControlProps) {
  return (
    <ColorGradientControl
      label={label}
      colorValue={value || undefined}
      onColorChange={(color: string | undefined) => onChange(color || "")}
      gradients={[]}
      disableCustomGradients
      enableAlpha
      clearable={clearable}
      __experimentalIsRenderedInSidebar
      __nextHasNoMarginBottom
    />
  );
}
