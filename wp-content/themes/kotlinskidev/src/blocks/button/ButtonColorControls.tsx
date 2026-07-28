import React from "react";
import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ColorGradientControl } from "../shared/color-gradient-control";

interface ColorGradientPair {
  color: string;
  gradient: string;
  onColorChange: (color: string) => void;
  onGradientChange: (gradient: string) => void;
}

export interface ButtonColorPanelProps {
  title: string;
  initialOpen?: boolean;
  text: ColorGradientPair;
  background: ColorGradientPair;
  border: ColorGradientPair;
}

function ColorGradientRow({ label, pair }: { label: string; pair: ColorGradientPair }) {
  return (
    <ColorGradientControl
      label={label}
      colorValue={pair.color || undefined}
      gradientValue={pair.gradient || undefined}
      onColorChange={(value) => pair.onColorChange(value ?? "")}
      onGradientChange={(value) => pair.onGradientChange(value ?? "")}
      clearable
      __nextHasNoMarginBottom
    />
  );
}

export function ButtonColorPanel({
  title,
  initialOpen = false,
  text,
  background,
  border,
}: ButtonColorPanelProps) {
  return (
    <PanelBody title={title} initialOpen={initialOpen}>
      <ColorGradientRow label={__("Text", "kotlinskidev")} pair={text} />
      <ColorGradientRow label={__("Background", "kotlinskidev")} pair={background} />
      <ColorGradientRow label={__("Border", "kotlinskidev")} pair={border} />
    </PanelBody>
  );
}
