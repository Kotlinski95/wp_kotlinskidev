import React from "react";
import { InspectorControls, useBlockProps, useSettings } from "@wordpress/block-editor";
import { useEffect, useRef } from "@wordpress/element";
import { mountFeatureCanvas } from "./runtime";
import { AnimationPanel, CanvasPanel, ColourPanel } from "./edit-panels";
import type { FeatureCardCanvasAttributes, PaletteEntry } from "./attributes";

export type { FeatureCardCanvasAttributes } from "./attributes";

interface EditProps {
  attributes: FeatureCardCanvasAttributes;
  setAttributes: (attrs: Partial<FeatureCardCanvasAttributes>) => void;
}

const toEntries = (raw: unknown): PaletteEntry[] => {
  if (Array.isArray(raw)) {
    return raw as PaletteEntry[];
  }
  if (raw && typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>).flatMap(toEntries);
  }
  return [];
};

const useMountedCanvas = (
  hostRef: React.RefObject<HTMLDivElement>,
  { variant, accentColor }: FeatureCardCanvasAttributes,
  labelsJson: string
): void => {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }
    const handle = mountFeatureCanvas(host, {
      variant,
      labels: JSON.parse(labelsJson),
      accent: accentColor || "primary",
    });
    return () => handle.destroy();
  }, [hostRef, variant, labelsJson, accentColor]);
};

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { variant, aspectRatio, labelOne, labelTwo, labelThree, accentColor, trigger } = attributes;
  const blockProps = useBlockProps();
  const hostRef = useRef<HTMLDivElement>(null);
  const labelsJson = JSON.stringify([labelOne, labelTwo, labelThree]);
  const [rawPalette] = useSettings("color.palette");
  const panelProps = { attributes, setAttributes };

  useMountedCanvas(hostRef, attributes, labelsJson);

  return (
    <>
      <InspectorControls>
        <CanvasPanel {...panelProps} />
        <ColourPanel {...panelProps} palette={toEntries(rawPalette)} />
        <AnimationPanel {...panelProps} />
      </InspectorControls>

      <div {...blockProps}>
        <div
          ref={hostRef}
          className="kt-feature-canvas"
          style={{ aspectRatio }}
          data-variant={variant}
          data-labels={labelsJson}
          data-accent={accentColor || "primary"}
          data-trigger={trigger}
        >
          <canvas className="kt-feature-canvas__canvas" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
