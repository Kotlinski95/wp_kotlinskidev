import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, RangeControl, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

export const PARALLAX_INTENSITY_DEFAULT = 15;
export const PARALLAX_INTENSITY_MIN = 0;
export const PARALLAX_INTENSITY_MAX = 30;

interface ParallaxAttributes {
  enableParallax?: boolean;
  parallaxIntensity?: number;
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
        parallaxIntensity: {
          type: "number",
          default: PARALLAX_INTENSITY_DEFAULT,
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

    const { enableParallax = false, parallaxIntensity = PARALLAX_INTENSITY_DEFAULT } = attributes;

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
            {enableParallax && (
              <RangeControl
                label={__("Parallax Intensity", "kotlinskidev")}
                help={__(
                  "How far the background shifts relative to the content while scrolling. Only applies on pages where a horizontal scroll section forces the fallback effect.",
                  "kotlinskidev"
                )}
                value={parallaxIntensity}
                min={PARALLAX_INTENSITY_MIN}
                max={PARALLAX_INTENSITY_MAX}
                onChange={(value?: number) =>
                  setAttributes({ parallaxIntensity: value ?? PARALLAX_INTENSITY_DEFAULT })
                }
              />
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withParallaxControls");

addFilter("editor.BlockEdit", "kotlinskidev/cover-parallax-controls", withParallaxControls);
