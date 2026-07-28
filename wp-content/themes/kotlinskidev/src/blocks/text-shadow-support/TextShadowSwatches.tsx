import React, { type CSSProperties } from "react";
import { __ } from "@wordpress/i18n";
import { useSettings } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";

export interface TextShadowSwatchesProps {
  value: string;
  onChange: (value: string) => void;
}

const NONE_VALUE = "none";

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const swatchLetterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: "0.25rem",
  background: "#e0e0e0",
  fontSize: "1.25rem",
  fontWeight: 700,
};

export function TextShadowSwatches({ value, onChange }: TextShadowSwatchesProps) {
  const [presets] = useSettings("custom.textShadow") as [Record<string, string> | undefined];

  const options = [
    { slug: "none", label: __("None", "kotlinskidev"), value: NONE_VALUE },
    ...Object.keys(presets ?? {}).map((slug) => ({
      slug,
      label: slugToLabel(slug),
      value: `var(--wp--custom--text-shadow--${slug})`,
    })),
  ];

  return (
    <div
      role="listbox"
      aria-label={__("Text shadow presets", "kotlinskidev")}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(2.75rem, 1fr))",
        gap: "0.5rem",
      }}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const isAdaptive = option.slug.startsWith("adaptive");

        return (
          <Button
            key={option.slug}
            className="kt-text-shadow-swatch"
            label={option.label}
            showTooltip
            role="option"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            style={{
              padding: 0,
              minWidth: 0,
              minHeight: 0,
              border: "none",
              background: "transparent",
              borderRadius: "0.375rem",
            }}
          >
            <span
              className="kt-text-shadow-swatch__letter"
              style={{
                ...swatchLetterStyle,
                color: isAdaptive ? "var(--wp--preset--color--foreground)" : "#1e1e1e",
                textShadow: option.slug === "none" ? "none" : option.value,
                outline: isSelected
                  ? "2px solid var(--wp-admin-theme-color, #3858e9)"
                  : "2px solid transparent",
                outlineOffset: "2px",
              }}
            >
              K
            </span>
          </Button>
        );
      })}
    </div>
  );
}
