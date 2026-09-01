import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { Fragment, useRef } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { PanelColorGradientSettings } from "../shared/color-gradient-control";

interface ColorSupport {
  text?: boolean;
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  supports?: {
    color?: boolean | ColorSupport;
    __experimentalColor?: boolean | ColorSupport;
  };
  [key: string]: unknown;
}

const supportsTextGradient = (settings: BlockSettings): boolean => {
  if (!settings.name) {
    return false;
  }
  const colorSupport = settings.supports?.color ?? settings.supports?.__experimentalColor;
  if (!colorSupport || typeof colorSupport === "boolean") {
    return false;
  }
  return colorSupport.text !== false;
};

const addTextGradientAttribute = (settings: BlockSettings): BlockSettings => {
  if (!supportsTextGradient(settings)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      textGradient: {
        type: "string",
        default: "",
      },
    },
  };
};

interface TextColorStyle {
  color?: { text?: string };
  [key: string]: unknown;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    textGradient?: string;
    textColor?: string;
    style?: TextColorStyle;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withTextGradientControl = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!props.name) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const nativeTextColor = attributes.style?.color?.text || attributes.textColor;
    const textGradient = attributes.textGradient || "";
    const textGradientRef = useRef(textGradient);
    textGradientRef.current = textGradient;
    const nativeTextColorRef = useRef(nativeTextColor);
    nativeTextColorRef.current = nativeTextColor;

    const setTextColor = (value?: string) => {
      nativeTextColorRef.current = value || "";
      if (value) {
        textGradientRef.current = "";
      }
      setAttributes({
        textColor: undefined,
        textGradient: textGradientRef.current,
        style: {
          ...attributes.style,
          color: { ...attributes.style?.color, text: nativeTextColorRef.current || undefined },
        },
      });
    };

    const setTextGradient = (value?: string) => {
      textGradientRef.current = value || "";
      if (value) {
        nativeTextColorRef.current = "";
      }
      setAttributes({
        textGradient: value || "",
        textColor: value ? undefined : attributes.textColor,
        style: {
          ...attributes.style,
          color: { ...attributes.style?.color, text: nativeTextColorRef.current || undefined },
        },
      });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="color">
          <div style={{ gridColumn: "span 2" }}>
            <PanelColorGradientSettings
              title={__("Text Gradient", "kotlinskidev")}
              showTitle={false}
              __experimentalIsRenderedInSidebar
              settings={[
                {
                  label: __("Text Gradient", "kotlinskidev"),
                  colorValue: nativeTextColor || undefined,
                  gradientValue: textGradient || undefined,
                  onColorChange: setTextColor,
                  onGradientChange: setTextGradient,
                  clearable: true,
                  isShownByDefault: true,
                },
              ]}
            />
          </div>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withTextGradientControl");

const buildTextGradientStyle = (textGradient: string | undefined): Record<string, string> => {
  if (!textGradient) {
    return {};
  }
  return { "--kt-text-gradient": textGradient };
};

interface BlockListBlockProps {
  attributes?: {
    textGradient?: string;
  };
  className?: string;
  wrapperProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const withTextGradientPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const textGradient = props.attributes?.textGradient;
    const style = buildTextGradientStyle(textGradient);

    if (Object.keys(style).length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} kt-gradient-text`.trim()}
        wrapperProps={{
          ...props.wrapperProps,
          style: { ...((props.wrapperProps?.style as Record<string, string>) || {}), ...style },
        }}
      />
    );
  };
}, "withTextGradientPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/text-gradient-attributes",
  addTextGradientAttribute
);

addFilter("editor.BlockEdit", "kotlinskidev/text-gradient-controls", withTextGradientControl);

addFilter("editor.BlockListBlock", "kotlinskidev/text-gradient-preview", withTextGradientPreview);
