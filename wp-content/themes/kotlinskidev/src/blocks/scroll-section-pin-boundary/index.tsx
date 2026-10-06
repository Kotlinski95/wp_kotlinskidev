import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

const EXCLUDED_BLOCKS = ["core/html", "core/code", "core/preformatted", "core/verse"];

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addScrollSectionPinBoundaryAttribute = (settings: BlockSettings): BlockSettings => {
  if (
    EXCLUDED_BLOCKS.includes(settings.name ?? "") ||
    DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "") ||
    typeof settings.attributes === "undefined"
  ) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      scrollSectionPinBoundary: {
        type: "boolean",
        default: false,
      },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & { scrollSectionPinBoundary?: boolean };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withScrollSectionPinBoundaryControl = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (
      EXCLUDED_BLOCKS.includes(props.name ?? "") ||
      DYNAMIC_PREVIEW_BLOCKS.includes(props.name ?? "")
    ) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody
            title={__("Scroll Section Pinning (GSAP)", "kotlinskidev")}
            icon="move"
            initialOpen={false}
          >
            <ToggleControl
              label={__("Use as scroll-section pin boundary", "kotlinskidev")}
              checked={Boolean(attributes.scrollSectionPinBoundary)}
              onChange={(value: boolean) => setAttributes({ scrollSectionPinBoundary: value })}
              help={__(
                "For a kotlinskidev/scroll-section set to the “Natural” pinning strategy, nested anywhere inside this block: pins this whole block instead of just the section, so content before/after it (within this block) stays visible, frozen, for the whole horizontal scroll — matching how the legacy strategy always looked. Has no effect without a natural-strategy scroll-section inside.",
                "kotlinskidev"
              )}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withScrollSectionPinBoundaryControl");

function applyScrollSectionPinBoundaryClass(
  extraProps: Record<string, unknown>,
  blockType: unknown,
  attributes: Record<string, unknown> & { scrollSectionPinBoundary?: boolean }
): Record<string, unknown> {
  if (!attributes.scrollSectionPinBoundary) {
    return extraProps;
  }

  const existingClassName = typeof extraProps.className === "string" ? extraProps.className : "";
  extraProps.className = existingClassName
    ? `${existingClassName} scroll-section-pin-boundary`
    : "scroll-section-pin-boundary";

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/scroll-section-pin-boundary-attribute",
  addScrollSectionPinBoundaryAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/scroll-section-pin-boundary-control",
  withScrollSectionPinBoundaryControl
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/scroll-section-pin-boundary-class",
  applyScrollSectionPinBoundaryClass
);
