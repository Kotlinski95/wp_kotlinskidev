import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import {
  hasBlockSupport as hasBlockSupportUntyped,
  type BlockConfiguration,
} from "@wordpress/blocks";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import { TextShadowSwatches } from "./TextShadowSwatches";

const hasBlockSupport = hasBlockSupportUntyped as (name: string, feature: string) => boolean;

const ATTRIBUTE_NAME = "kotlinskidevTextShadow";

function addTextShadowAttribute(settings: BlockConfiguration) {
  const supports = settings.supports as Record<string, unknown> | undefined;
  if (!supports?.shadow) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      [ATTRIBUTE_NAME]: {
        type: "string",
        default: "",
      },
    },
  };
}

interface TextShadowControlsProps {
  value: string;
  onChange: (value: string) => void;
}

function TextShadowControls({ value, onChange }: TextShadowControlsProps) {
  return (
    <PanelBody title={__("Text Shadow", "kotlinskidev")} initialOpen={false}>
      <p
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          color: "#757575",
          fontSize: "0.8125rem",
        }}
      >
        {__(
          "Adaptive presets follow the current text color and switch with light/dark mode. Light/Dark presets stay fixed to one mode's color regardless of the active theme.",
          "kotlinskidev"
        )}
      </p>
      <div style={{ marginTop: "0.5rem" }}>
        <TextShadowSwatches value={value} onChange={onChange} />
      </div>
    </PanelBody>
  );
}

interface BlockEditLikeProps {
  name: string;
  attributes: Record<string, unknown>;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withTextShadowControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditLikeProps) => {
    if (!hasBlockSupport(props.name, "shadow")) {
      return <BlockEdit {...props} />;
    }

    const value = (props.attributes[ATTRIBUTE_NAME] as string) || "";

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="styles">
          <TextShadowControls
            value={value}
            onChange={(next) => props.setAttributes({ [ATTRIBUTE_NAME]: next })}
          />
        </InspectorControls>
      </Fragment>
    );
  };
}, "withTextShadowControls");

interface BlockListBlockLikeProps {
  attributes?: Record<string, unknown>;
  wrapperProps?: Record<string, unknown>;
}

const withTextShadowPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockLikeProps) => {
    const textShadow = props.attributes?.[ATTRIBUTE_NAME] as string | undefined;

    if (!textShadow) {
      return <BlockListBlock {...props} />;
    }

    const wrapperProps = {
      ...props.wrapperProps,
      style: {
        ...((props.wrapperProps?.style as Record<string, unknown>) ?? {}),
        textShadow,
      },
    };

    return <BlockListBlock {...props} wrapperProps={wrapperProps} />;
  };
}, "withTextShadowPreview");

addFilter("blocks.registerBlockType", "kotlinskidev/text-shadow-attribute", addTextShadowAttribute);
addFilter("editor.BlockEdit", "kotlinskidev/text-shadow-controls", withTextShadowControls);
addFilter("editor.BlockListBlock", "kotlinskidev/text-shadow-preview", withTextShadowPreview);
