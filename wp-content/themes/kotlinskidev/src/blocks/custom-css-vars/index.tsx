import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, TextControl, Button } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { closeSmall } from "@wordpress/icons";

declare global {
  interface Window {
    kotlinskidevCssVarBlocks?: string[];
  }
}

interface CustomCssVarEntry {
  name: string;
  value: string;
}

const DEFAULT_SUPPORTED_BLOCKS = ["kotlinskidev/icon", "core/image", "core/site-logo"];

const getSupportedBlocks = (): string[] =>
  window.kotlinskidevCssVarBlocks ?? DEFAULT_SUPPORTED_BLOCKS;

const isSupportedBlock = (blockName: string | undefined): boolean =>
  !!blockName && getSupportedBlocks().includes(blockName);

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addCustomCssVarsAttribute = (settings: BlockSettings): BlockSettings => {
  if (!isSupportedBlock(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      customCssVars: {
        type: "array",
        default: [],
      },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & { customCssVars?: CustomCssVarEntry[] };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withCustomCssVarsControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!isSupportedBlock(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const customCssVars = attributes.customCssVars ?? [];

    const updateEntry = (index: number, key: keyof CustomCssVarEntry, value: string) => {
      const next = customCssVars.map((entry, i) =>
        i === index ? { ...entry, [key]: value } : entry
      );
      setAttributes({ customCssVars: next });
    };

    const removeEntry = (index: number) => {
      setAttributes({ customCssVars: customCssVars.filter((_, i) => i !== index) });
    };

    const addEntry = () => {
      setAttributes({ customCssVars: [...customCssVars, { name: "", value: "" }] });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Custom CSS Variables", "kotlinskidev")} initialOpen={false}>
            <p style={{ fontSize: "0.75rem", color: "#666", margin: "0 0 0.9375rem 0" }}>
              {__(
                "Applied as inline style on this block, e.g. --logo-icon-bg: #1c1d18. Reference them from the SVG's own fill/stroke attributes.",
                "kotlinskidev"
              )}
            </p>

            {customCssVars.map((entry, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                  marginBottom: "0.75rem",
                }}
              >
                <TextControl
                  label={__("Name", "kotlinskidev")}
                  placeholder="--logo-icon-bg"
                  value={entry.name}
                  onChange={(value: string) => updateEntry(index, "name", value)}
                />
                <TextControl
                  label={__("Value", "kotlinskidev")}
                  placeholder="#1c1d18"
                  value={entry.value}
                  onChange={(value: string) => updateEntry(index, "value", value)}
                />
                <Button
                  icon={closeSmall}
                  label={__("Remove variable", "kotlinskidev")}
                  onClick={() => removeEntry(index)}
                />
              </div>
            ))}

            <Button variant="secondary" onClick={addEntry}>
              {__("Add Variable", "kotlinskidev")}
            </Button>
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withCustomCssVarsControls");

const isValidVarName = (name: string): boolean => /^--[a-zA-Z][a-zA-Z0-9-]*$/.test(name);

const buildCustomCssVarsStyle = (
  customCssVars: CustomCssVarEntry[] | undefined
): Record<string, string> => {
  const style: Record<string, string> = {};

  if (!customCssVars) {
    return style;
  }

  customCssVars.forEach(({ name, value }) => {
    if (isValidVarName(name) && value.trim() !== "") {
      style[name] = value;
    }
  });

  return style;
};

interface BlockListBlockProps {
  name?: string;
  attributes?: { customCssVars?: CustomCssVarEntry[] };
  wrapperProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const withCustomCssVarsPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    if (!isSupportedBlock(props.name)) {
      return <BlockListBlock {...props} />;
    }

    const style = buildCustomCssVarsStyle(props.attributes?.customCssVars);

    if (Object.keys(style).length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        wrapperProps={{
          ...props.wrapperProps,
          style: { ...((props.wrapperProps?.style as Record<string, string>) || {}), ...style },
        }}
      />
    );
  };
}, "withCustomCssVarsPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/custom-css-vars-attributes",
  addCustomCssVarsAttribute
);

addFilter("editor.BlockEdit", "kotlinskidev/custom-css-vars-controls", withCustomCssVarsControls);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/custom-css-vars-preview",
  withCustomCssVarsPreview
);
