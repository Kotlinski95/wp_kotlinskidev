import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

interface LinkHoverEffects {
  disableBackgroundHover?: boolean;
  disableUnderlineHover?: boolean;
  disableLinkGradient?: boolean;
  enableUnderlineHover?: boolean;
}

interface BlockAttributes {
  linkHoverEffects?: LinkHoverEffects;
}

interface BlockEditProps {
  name?: string;
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addLinkHoverEffectsAttribute = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "")) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      linkHoverEffects: {
        type: "object",
        default: {},
      },
    },
  };
};

const withLinkHoverEffectsControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (DYNAMIC_PREVIEW_BLOCKS.includes(props.name ?? "")) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const linkHoverEffects = attributes.linkHoverEffects || {};

    const update = (key: keyof LinkHoverEffects, value: boolean) => {
      setAttributes({
        linkHoverEffects: { ...linkHoverEffects, [key]: value },
      });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Link Hover Effects", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Enable underline hover effect", "kotlinskidev")}
              help={__(
                "Adds the same animated sliding-underline hover/focus effect used sitewide in the header and footer to links in this block, even outside those areas or on elements that aren't a native link.",
                "kotlinskidev"
              )}
              checked={!!linkHoverEffects.enableUnderlineHover}
              onChange={(value) => update("enableUnderlineHover", value)}
            />
            <ToggleControl
              label={__("Disable background hover effect", "kotlinskidev")}
              help={__(
                "Turns off the gradient/fill hover effect on links inside this block.",
                "kotlinskidev"
              )}
              checked={!!linkHoverEffects.disableBackgroundHover}
              onChange={(value) => update("disableBackgroundHover", value)}
            />
            <ToggleControl
              label={__("Disable underline hover effect", "kotlinskidev")}
              help={__(
                "Turns off the sliding underline hover/focus effect on links inside this block.",
                "kotlinskidev"
              )}
              checked={!!linkHoverEffects.disableUnderlineHover}
              onChange={(value) => update("disableUnderlineHover", value)}
            />
            <ToggleControl
              label={__("Disable link underline/gradient effect", "kotlinskidev")}
              help={__(
                "Excludes links in this block from the sitewide header/footer hover-underline and gradient-text-on-focus effect, without affecting this block's own hover/focus styling. Enabled by default sitewide; turn this on only where it conflicts, like the Social Link block.",
                "kotlinskidev"
              )}
              checked={!!linkHoverEffects.disableLinkGradient}
              onChange={(value) => update("disableLinkGradient", value)}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withLinkHoverEffectsControls");

interface BlockListBlockProps {
  attributes?: BlockAttributes;
  className?: string;
  [key: string]: unknown;
}

const withLinkHoverEffectsPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    const linkHoverEffects = props.attributes?.linkHoverEffects;

    const classes = [
      linkHoverEffects?.disableBackgroundHover && "kt-hover-no-background",
      linkHoverEffects?.disableUnderlineHover && "kt-hover-no-underline",
      linkHoverEffects?.enableUnderlineHover && "kt-hover-add-underline",
    ].filter(Boolean) as string[];

    if (classes.length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        className={[props.className, ...classes].filter(Boolean).join(" ")}
      />
    );
  };
}, "withLinkHoverEffectsPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/link-hover-effects-attributes",
  addLinkHoverEffectsAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/link-hover-effects-controls",
  withLinkHoverEffectsControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/link-hover-effects-preview",
  withLinkHoverEffectsPreview
);
