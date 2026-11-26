import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { Fragment } from "@wordpress/element";
import { OverlayPanel } from "./OverlayPanel";
import {
  DEFAULT_BACKGROUND_OPACITY,
  opacityToFraction,
  readOverlayValues,
  type OverlayAttributes,
  type OverlayValues,
} from "./overlay-attributes";

const IMAGE_OVERLAY_BLOCKS = ["core/image"];

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

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & OverlayAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const overlayPreviewStyle = (values: OverlayValues): React.CSSProperties =>
  ({
    position: "relative",
    "--kt-overlay-bg": values.backgroundColor || undefined,
    "--kt-overlay-bg-opacity": opacityToFraction(values.backgroundOpacity),
    "--kt-overlay-text": values.textColor || undefined,
  }) as React.CSSProperties;

const OverlayPreviewContent = ({ values }: { values: OverlayValues }): JSX.Element | null => {
  const { enabled, heading, description } = values;
  if (!enabled || !(heading || description)) {
    return null;
  }
  return (
    <div className="kt-image-hover-overlay-editor__content">
      {heading && <span className="kt-image-hover-overlay__heading">{heading}</span>}
      {description && <span className="kt-image-hover-overlay__description">{description}</span>}
    </div>
  );
};

const withImageOverlayControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsImageOverlay(props.name)) {
      return <BlockEdit {...props} />;
    }

    const values = readOverlayValues(props.attributes);

    return (
      <Fragment>
        <div className="kt-image-hover-overlay-editor" style={overlayPreviewStyle(values)}>
          <BlockEdit {...props} />
          <OverlayPreviewContent values={values} />
        </div>
        <OverlayPanel values={values} setAttributes={props.setAttributes} />
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

  const { backgroundColor, backgroundOpacity, textColor } = readOverlayValues(attributes);
  const hasCustomOpacity = backgroundOpacity !== DEFAULT_BACKGROUND_OPACITY;

  if (!backgroundColor && !textColor && !hasCustomOpacity) {
    return extraProps;
  }

  extraProps.style = {
    ...extraProps.style,
    ...(backgroundColor && { "--kt-overlay-bg": backgroundColor }),
    ...(hasCustomOpacity && { "--kt-overlay-bg-opacity": opacityToFraction(backgroundOpacity) }),
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
