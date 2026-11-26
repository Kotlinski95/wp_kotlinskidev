import React from "react";
import { useSettings } from "@wordpress/block-editor";
import {
  PanelBody,
  Button,
  SelectControl,
  ColorPalette,
  ToggleControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { ScrollSectionAttributes } from "./edit";

type TriggerValue = ScrollSectionAttributes["trigger"];
type SlideWidth = ScrollSectionAttributes["slideWidth"];
type SetScrollSectionAttributes = (attributes: Partial<ScrollSectionAttributes>) => void;

interface ThemeSpacingSize {
  name: string;
  slug: string;
  size: string;
}

interface AttributePanelProps {
  attributes: ScrollSectionAttributes;
  setAttributes: SetScrollSectionAttributes;
}

function useSpacingSizes(): ThemeSpacingSize[] {
  const [customSpacingSizes, themeSpacingSizes] = useSettings(
    "spacing.spacingSizes.custom",
    "spacing.spacingSizes.theme"
  ) as [ThemeSpacingSize[] | undefined, ThemeSpacingSize[] | undefined];
  return [...(customSpacingSizes ?? []), ...(themeSpacingSizes ?? [])];
}

function SlideSpacingControl({ attributes, setAttributes }: AttributePanelProps) {
  const spacingSizes = useSpacingSizes();
  if (attributes.slideWidth !== "auto" || spacingSizes.length === 0) {
    return null;
  }
  return (
    <SelectControl
      label={__("Slide spacing", "kotlinskidev")}
      value={attributes.slideGap}
      options={spacingSizes.map((size) => ({ label: size.name, value: size.slug }))}
      onChange={(value: string) => setAttributes({ slideGap: value })}
      help={__(
        "Scales fluidly between breakpoints — smaller on mobile, larger on wide screens. Add or edit sizes in theme.json's settings.spacing.spacingSizes.",
        "kotlinskidev"
      )}
    />
  );
}

export function BehaviourPanel({ attributes, setAttributes }: AttributePanelProps) {
  return (
    <PanelBody title={__("Behaviour", "kotlinskidev")} initialOpen>
      <SelectControl
        label={__("Trigger point", "kotlinskidev")}
        value={attributes.trigger}
        options={[
          { label: __("Bottom of screen", "kotlinskidev"), value: "bottom" as TriggerValue },
          { label: __("Center of screen", "kotlinskidev"), value: "center" as TriggerValue },
          { label: __("Top of screen", "kotlinskidev"), value: "top" as TriggerValue },
        ]}
        onChange={(value: string) => setAttributes({ trigger: value as TriggerValue })}
      />
      <SelectControl
        label={__("Slide width", "kotlinskidev")}
        value={attributes.slideWidth}
        options={[
          { label: __("Auto", "kotlinskidev"), value: "auto" as SlideWidth },
          { label: __("Full", "kotlinskidev"), value: "full" as SlideWidth },
        ]}
        onChange={(value: string) => setAttributes({ slideWidth: value as SlideWidth })}
      />
      <SlideSpacingControl attributes={attributes} setAttributes={setAttributes} />
      <ToggleControl
        label={__("Show markers", "kotlinskidev")}
        checked={attributes.markers}
        onChange={(value: boolean) => setAttributes({ markers: value })}
      />
    </PanelBody>
  );
}

export function BackgroundPanel({ attributes, setAttributes }: AttributePanelProps) {
  return (
    <PanelBody title={__("Background", "kotlinskidev")}>
      <ColorPalette
        value={attributes.backgroundColor || undefined}
        onChange={(value: string | undefined) => setAttributes({ backgroundColor: value ?? "" })}
      />
    </PanelBody>
  );
}

interface ItemsPanelProps {
  itemCount: number;
  onAddItem: () => void;
  onRemoveLastItem: () => void;
}

export function ItemsPanel({ itemCount, onAddItem, onRemoveLastItem }: ItemsPanelProps) {
  return (
    <PanelBody title={__("Items", "kotlinskidev")} initialOpen>
      <p className="scroll-section-sidebar__count">
        {itemCount} {__("item(s)", "kotlinskidev")}
      </p>
      <Button
        variant="secondary"
        onClick={onAddItem}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {__("+ Add Item", "kotlinskidev")}
      </Button>
      {itemCount > 1 && (
        <Button
          variant="tertiary"
          isDestructive
          onClick={onRemoveLastItem}
          style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
        >
          {__("Remove Last Item", "kotlinskidev")}
        </Button>
      )}
    </PanelBody>
  );
}
