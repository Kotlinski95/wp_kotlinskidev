import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, RangeControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const LINE_CLAMP_BLOCKS = ["core/paragraph"];
const MIN_LINES = 1;
const MAX_LINES = 10;
const DEFAULT_LINES = 3;

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsLineClamp = (name?: string): boolean =>
  Boolean(name && LINE_CLAMP_BLOCKS.includes(name));

const addLineClampAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsLineClamp(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevLineClampEnabled: { type: "boolean", default: false },
      kotlinskidevLineClampLines: { type: "number", default: DEFAULT_LINES },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    kotlinskidevLineClampEnabled?: boolean;
    kotlinskidevLineClampLines?: number;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withLineClampControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsLineClamp(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const enabled = Boolean(attributes.kotlinskidevLineClampEnabled);
    const lines = attributes.kotlinskidevLineClampLines ?? DEFAULT_LINES;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="styles">
          <PanelBody title={__("Truncate Text", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Limit to a number of lines", "kotlinskidev")}
              checked={enabled}
              onChange={(next) => setAttributes({ kotlinskidevLineClampEnabled: next })}
            />
            {enabled && (
              <>
                <RangeControl
                  label={__("Visible lines", "kotlinskidev")}
                  value={lines}
                  min={MIN_LINES}
                  max={MAX_LINES}
                  onChange={(next) =>
                    setAttributes({ kotlinskidevLineClampLines: next ?? DEFAULT_LINES })
                  }
                />
                <p className="components-base-control__help">
                  {__(
                    'Text past this many lines is hidden behind a "Read more" toggle, translated automatically for each site language.',
                    "kotlinskidev"
                  )}
                </p>
              </>
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withLineClampControls");

interface BlockListBlockProps {
  attributes?: {
    kotlinskidevLineClampEnabled?: boolean;
    kotlinskidevLineClampLines?: number;
  };
  wrapperProps?: Record<string, unknown>;
}

const withLineClampPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const enabled = Boolean(props.attributes?.kotlinskidevLineClampEnabled);
    const lines = props.attributes?.kotlinskidevLineClampLines ?? DEFAULT_LINES;

    if (!enabled) {
      return <BlockListBlock {...props} />;
    }

    const wrapperProps = {
      ...props.wrapperProps,
      style: {
        ...((props.wrapperProps?.style as Record<string, unknown>) ?? {}),
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: lines,
        overflow: "hidden",
      },
    };

    return <BlockListBlock {...props} wrapperProps={wrapperProps} />;
  };
}, "withLineClampPreview");

addFilter("blocks.registerBlockType", "kotlinskidev/line-clamp-attributes", addLineClampAttributes);
addFilter("editor.BlockEdit", "kotlinskidev/line-clamp-controls", withLineClampControls);
addFilter("editor.BlockListBlock", "kotlinskidev/line-clamp-preview", withLineClampPreview);
