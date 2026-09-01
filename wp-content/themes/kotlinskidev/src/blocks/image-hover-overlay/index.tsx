import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import {
  PanelBody,
  ToggleControl,
  TextControl,
  TextareaControl,
  RangeControl,
} from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const IMAGE_OVERLAY_BLOCKS = ["core/image"];
const DEFAULT_BACKGROUND_OPACITY = 100;

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsImageOverlay = (name?: string): boolean =>
  Boolean(name && IMAGE_OVERLAY_BLOCKS.includes(name));

const addImageOverlayAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsImageOverlay(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevOverlayEnabled: { type: "boolean", default: false },
      kotlinskidevOverlayHeading: { type: "string", default: "" },
      kotlinskidevOverlayDescription: { type: "string", default: "" },
      kotlinskidevOverlayBackgroundColor: { type: "string", default: "" },
      kotlinskidevOverlayBackgroundOpacity: {
        type: "number",
        default: DEFAULT_BACKGROUND_OPACITY,
      },
      kotlinskidevOverlayTextColor: { type: "string", default: "" },
    },
  };
};

interface OverlayAttributes {
  kotlinskidevOverlayEnabled?: boolean;
  kotlinskidevOverlayHeading?: string;
  kotlinskidevOverlayDescription?: string;
  kotlinskidevOverlayBackgroundColor?: string;
  kotlinskidevOverlayBackgroundOpacity?: number;
  kotlinskidevOverlayTextColor?: string;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & OverlayAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withImageOverlayControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsImageOverlay(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const enabled = Boolean(attributes.kotlinskidevOverlayEnabled);
    const heading = attributes.kotlinskidevOverlayHeading ?? "";
    const description = attributes.kotlinskidevOverlayDescription ?? "";
    const backgroundColor = attributes.kotlinskidevOverlayBackgroundColor ?? "";
    const backgroundOpacity =
      attributes.kotlinskidevOverlayBackgroundOpacity ?? DEFAULT_BACKGROUND_OPACITY;
    const textColor = attributes.kotlinskidevOverlayTextColor ?? "";
    const isBgGradient = backgroundColor.includes("gradient");

    // ColorGradientControl fires onColorChange(value) and onGradientChange(undefined)
    // back-to-back when picking a flat color (it clears the "other" representation) —
    // without this guard the immediate clear call wipes out the color we just set.
    const pendingBgColorRef = React.useRef<string | null>(null);
    const handleBackgroundColorChange = (value: string | undefined) => {
      if (value !== undefined) {
        pendingBgColorRef.current = value;
        setAttributes({ kotlinskidevOverlayBackgroundColor: value });
      } else if (pendingBgColorRef.current !== null) {
        pendingBgColorRef.current = null;
      } else {
        setAttributes({ kotlinskidevOverlayBackgroundColor: "" });
      }
    };

    return (
      <Fragment>
        <div
          className="kt-image-hover-overlay-editor"
          style={
            {
              position: "relative",
              "--kt-overlay-bg": backgroundColor || undefined,
              "--kt-overlay-bg-opacity": backgroundOpacity / 100,
              "--kt-overlay-text": textColor || undefined,
            } as React.CSSProperties
          }
        >
          <BlockEdit {...props} />
          {enabled && (heading || description) && (
            <div className="kt-image-hover-overlay-editor__content">
              {heading && <span className="kt-image-hover-overlay__heading">{heading}</span>}
              {description && (
                <span className="kt-image-hover-overlay__description">{description}</span>
              )}
            </div>
          )}
        </div>
        <InspectorControls>
          <PanelBody title={__("Hover Overlay", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Show text overlay on hover", "kotlinskidev")}
              checked={enabled}
              onChange={(next) => setAttributes({ kotlinskidevOverlayEnabled: next })}
            />
            {enabled && (
              <>
                <TextControl
                  label={__("Heading", "kotlinskidev")}
                  value={heading}
                  onChange={(value) => setAttributes({ kotlinskidevOverlayHeading: value })}
                />
                <TextareaControl
                  label={__("Description", "kotlinskidev")}
                  value={description}
                  onChange={(value) => setAttributes({ kotlinskidevOverlayDescription: value })}
                />
                <ColorGradientControl
                  label={__("Overlay background color", "kotlinskidev")}
                  colorValue={backgroundColor && !isBgGradient ? backgroundColor : undefined}
                  gradientValue={isBgGradient ? backgroundColor : undefined}
                  onColorChange={handleBackgroundColorChange}
                  onGradientChange={handleBackgroundColorChange}
                  enableAlpha={true}
                  clearable={true}
                  __experimentalIsRenderedInSidebar={true}
                  __nextHasNoMarginBottom
                />
                <RangeControl
                  label={__("Overlay background opacity", "kotlinskidev")}
                  value={backgroundOpacity}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    setAttributes({
                      kotlinskidevOverlayBackgroundOpacity: value ?? DEFAULT_BACKGROUND_OPACITY,
                    })
                  }
                />
                <ColorGradientControl
                  label={__("Overlay text color", "kotlinskidev")}
                  colorValue={textColor || undefined}
                  onColorChange={(value: string | undefined) =>
                    setAttributes({ kotlinskidevOverlayTextColor: value ?? "" })
                  }
                  enableAlpha={true}
                  clearable={true}
                  __experimentalIsRenderedInSidebar={true}
                  __nextHasNoMarginBottom
                />
              </>
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withImageOverlayControls");

interface SaveContentExtraProps {
  className?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SaveBlockType {
  name?: string;
}

function applyImageOverlayProps(
  extraProps: SaveContentExtraProps,
  blockType: SaveBlockType,
  attributes: OverlayAttributes
): SaveContentExtraProps {
  if (!supportsImageOverlay(blockType.name) || !attributes.kotlinskidevOverlayEnabled) {
    return extraProps;
  }

  const backgroundColor = attributes.kotlinskidevOverlayBackgroundColor ?? "";
  const backgroundOpacity =
    attributes.kotlinskidevOverlayBackgroundOpacity ?? DEFAULT_BACKGROUND_OPACITY;
  const textColor = attributes.kotlinskidevOverlayTextColor ?? "";
  const hasCustomOpacity = backgroundOpacity !== DEFAULT_BACKGROUND_OPACITY;

  if (!backgroundColor && !textColor && !hasCustomOpacity) {
    return extraProps;
  }

  extraProps.style = {
    ...extraProps.style,
    ...(backgroundColor && { "--kt-overlay-bg": backgroundColor }),
    ...(hasCustomOpacity && { "--kt-overlay-bg-opacity": backgroundOpacity / 100 }),
    ...(textColor && { "--kt-overlay-text": textColor }),
  };

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/image-hover-overlay-attributes",
  addImageOverlayAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/image-hover-overlay-controls",
  withImageOverlayControls
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/image-hover-overlay-props",
  applyImageOverlayProps
);
