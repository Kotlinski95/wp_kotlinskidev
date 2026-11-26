import React, { useRef } from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelColorGradientSettings } from "../shared/color-gradient-control";

export interface ColorRow<K extends string> {
  attribute: K;
  label: string;
}

interface ColorSettingsProps<K extends string> {
  rows: ColorRow<K>[];
  values: Record<K, string>;
  onChange: (attrs: Partial<Record<K, string>>) => void;
}

const isGradient = (value: string): boolean => value.includes("gradient(");

export function ColorSettings<K extends string>({
  rows,
  values,
  onChange,
}: Readonly<ColorSettingsProps<K>>) {
  const latest = useRef<Record<string, string>>({});
  rows.forEach(({ attribute }) => {
    latest.current[attribute] = values[attribute];
  });

  const write = (attribute: K, value: string) => {
    latest.current[attribute] = value;
    onChange({ [attribute]: value } as Partial<Record<K, string>>);
  };

  const settings = rows.map(({ attribute, label }) => {
    const value = values[attribute];
    return {
      label,
      colorValue: isGradient(value) ? undefined : value || undefined,
      gradientValue: isGradient(value) ? value : undefined,
      onColorChange: (next?: string) => {
        if (next) {
          write(attribute, next);
        } else if (!isGradient(latest.current[attribute] ?? "")) {
          write(attribute, "");
        }
      },
      onGradientChange: (next?: string) => {
        if (next) {
          write(attribute, next);
        } else if (isGradient(latest.current[attribute] ?? "")) {
          write(attribute, "");
        }
      },
      clearable: true,
      isShownByDefault: true,
    };
  });

  return (
    <InspectorControls group="color">
      <div style={{ gridColumn: "span 2" }}>
        <PanelColorGradientSettings
          title=""
          showTitle={false}
          __experimentalIsRenderedInSidebar
          settings={settings}
        />
      </div>
    </InspectorControls>
  );
}
