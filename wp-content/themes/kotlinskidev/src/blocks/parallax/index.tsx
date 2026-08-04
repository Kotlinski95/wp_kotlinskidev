import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

interface ParallaxAttributes {
  enableParallax?: boolean;
}

interface CoverBlockAttributes extends ParallaxAttributes {
  [key: string]: unknown;
}

interface BlockEditProps {
  attributes: CoverBlockAttributes;
  setAttributes: (attributes: Partial<CoverBlockAttributes>) => void;
  name: string;
  clientId: string;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/cover-parallax-attributes",
  (settings: unknown, name: string) => {
    if (name !== "core/cover") {
      return settings;
    }

    return {
      ...(settings as object),
      attributes: {
        ...((settings as CoverBlockAttributes).attributes as object),
        enableParallax: {
          type: "boolean",
          default: false,
        },
      },
    };
  }
);

const withParallaxControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    const { attributes, setAttributes, name } = props;

    if (name !== "core/cover") {
      return <BlockEdit {...props} />;
    }

    const { enableParallax = false } = attributes;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody
            title={__("Parallax Settings", "kotlinskidev")}
            icon="format-image"
            initialOpen={false}
          >
            <ToggleControl
              label={__("Enable Parallax Effect", "kotlinskidev")}
              help={__(
                "Background stays fixed while content scrolls. Uses CSS background-attachment: fixed.",
                "kotlinskidev"
              )}
              checked={enableParallax}
              onChange={(value: boolean) => setAttributes({ enableParallax: value })}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withParallaxControls");

addFilter("editor.BlockEdit", "kotlinskidev/cover-parallax-controls", withParallaxControls);
