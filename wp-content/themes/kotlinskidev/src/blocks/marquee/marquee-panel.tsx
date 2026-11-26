import React from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, Button, RangeControl, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { MarqueeEditProps } from "./marquee-attributes";

const DEFAULT_DURATION_SECONDS = 30;
const DEFAULT_GAP_PX = 40;

interface MarqueePanelProps extends Pick<MarqueeEditProps, "attributes" | "setAttributes"> {
  itemCount: number;
  onAddItem: () => void;
  onRemoveLast: () => void;
}

const ItemButtons = ({
  itemCount,
  onAddItem,
  onRemoveLast,
}: Pick<MarqueePanelProps, "itemCount" | "onAddItem" | "onRemoveLast">) => (
  <>
    <p className="kt-marquee-sidebar__count">
      {itemCount} {__("item(s)", "kotlinskidev")}
    </p>
    <Button
      variant="secondary"
      onClick={onAddItem}
      style={{ width: "100%", justifyContent: "center" }}
    >
      {__("+ Add Technology", "kotlinskidev")}
    </Button>
    {itemCount > 1 && (
      <Button
        variant="tertiary"
        isDestructive
        onClick={onRemoveLast}
        style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
      >
        {__("Remove Last Technology", "kotlinskidev")}
      </Button>
    )}
  </>
);

export const MarqueePanel = ({
  attributes,
  setAttributes,
  itemCount,
  onAddItem,
  onRemoveLast,
}: MarqueePanelProps) => (
  <InspectorControls>
    <PanelBody title={__("Marquee", "kotlinskidev")} initialOpen>
      <RangeControl
        label={__("Scroll duration (seconds)", "kotlinskidev")}
        help={__("Time for one full loop — lower is faster.", "kotlinskidev")}
        min={5}
        max={120}
        value={attributes.speed}
        onChange={(value) => setAttributes({ speed: value ?? DEFAULT_DURATION_SECONDS })}
      />
      <SelectControl
        label={__("Direction", "kotlinskidev")}
        value={attributes.direction}
        options={[
          { label: __("Left (normal)", "kotlinskidev"), value: "normal" },
          { label: __("Right (reverse)", "kotlinskidev"), value: "reverse" },
        ]}
        onChange={(value) =>
          setAttributes({ direction: value === "reverse" ? "reverse" : "normal" })
        }
      />
      <RangeControl
        label={__("Spacing between items (px)", "kotlinskidev")}
        min={0}
        max={160}
        value={attributes.gap}
        onChange={(value) => setAttributes({ gap: value ?? DEFAULT_GAP_PX })}
      />
      <ItemButtons itemCount={itemCount} onAddItem={onAddItem} onRemoveLast={onRemoveLast} />
    </PanelBody>
  </InspectorControls>
);
