import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { Fragment, useEffect, useRef } from "@wordpress/element";
import { ColorGradientControl } from "../shared/color-gradient-control";
import "../../styles/border-gradient.scss";

const EXCLUDED_BLOCKS = ["kotlinskidev/button"];

interface BorderSupport {
  color?: boolean;
  radius?: boolean;
  style?: boolean;
  width?: boolean;
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  supports?: {
    border?: boolean | BorderSupport;
    __experimentalBorder?: boolean | BorderSupport;
  };
  [key: string]: unknown;
}

const supportsBorderGradient = (settings: BlockSettings): boolean => {
  if (!settings.name || EXCLUDED_BLOCKS.includes(settings.name)) {
    return false;
  }
  return Boolean(settings.supports?.border ?? settings.supports?.__experimentalBorder);
};

const addBorderGradientAttribute = (settings: BlockSettings): BlockSettings => {
  if (!supportsBorderGradient(settings)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      borderGradient: {
        type: "string",
        default: "",
      },
    },
  };
};

interface BorderStyle {
  border?: { color?: string; width?: string };
  [key: string]: unknown;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    borderGradient?: string;
    borderColor?: string;
    style?: BorderStyle;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withBorderGradientControl = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!props.name || EXCLUDED_BLOCKS.includes(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const nativeColor = attributes.style?.border?.color || attributes.borderColor;
    const borderGradient = attributes.borderGradient || "";
    const prevNativeColorRef = useRef(nativeColor);
    const borderGradientRef = useRef(borderGradient);
    borderGradientRef.current = borderGradient;

    useEffect(() => {
      if (nativeColor && nativeColor !== prevNativeColorRef.current && borderGradientRef.current) {
        setAttributes({ borderGradient: "" });
      }
      prevNativeColorRef.current = nativeColor;
    }, [nativeColor, setAttributes]);

    const setBorderColor = (value?: string) => {
      setAttributes({
        borderColor: undefined,
        style: {
          ...attributes.style,
          border: { ...attributes.style?.border, color: value || undefined },
        },
      });
    };

    const setBorderGradient = (value?: string) => {
      setAttributes({ borderGradient: value || "" });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="border">
          <ColorGradientControl
            colorValue={attributes.style?.border?.color || undefined}
            gradientValue={borderGradient || undefined}
            onColorChange={setBorderColor}
            onGradientChange={setBorderGradient}
            clearable
            __nextHasNoMarginBottom
          />
        </InspectorControls>
      </Fragment>
    );
  };
}, "withBorderGradientControl");

const buildBorderGradientStyle = (
  borderGradient: string | undefined,
  borderWidth: string | undefined
): Record<string, string> => {
  if (!borderGradient) {
    return {};
  }

  const style: Record<string, string> = {
    "--kt-border-gradient": borderGradient,
  };

  if (borderWidth) {
    style["--kt-border-width"] = borderWidth;
  }

  return style;
};

interface BlockListBlockProps {
  attributes?: {
    borderGradient?: string;
    style?: { border?: { width?: string } };
  };
  className?: string;
  wrapperProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const withBorderGradientPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const borderGradient = props.attributes?.borderGradient;
    const borderWidth = props.attributes?.style?.border?.width;
    const style = buildBorderGradientStyle(borderGradient, borderWidth);

    if (Object.keys(style).length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} kt-has-gradient-border`.trim()}
        wrapperProps={{
          ...props.wrapperProps,
          style: { ...((props.wrapperProps?.style as Record<string, string>) || {}), ...style },
        }}
      />
    );
  };
}, "withBorderGradientPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/border-gradient-attributes",
  addBorderGradientAttribute
);

addFilter("editor.BlockEdit", "kotlinskidev/border-gradient-controls", withBorderGradientControl);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/border-gradient-preview",
  withBorderGradientPreview
);
