import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, RangeControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

// Types
interface ParallaxAttributes {
  enableParallax?: boolean;
  parallaxSpeed?: number;
}

interface CoverBlockAttributes extends ParallaxAttributes {
  [key: string]: any;
}

interface BlockEditProps {
  attributes: CoverBlockAttributes;
  setAttributes: (attributes: Partial<CoverBlockAttributes>) => void;
  name: string;
  clientId: string;
}

// Add parallax attributes to core/cover block
addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/cover-parallax-attributes",
  (settings: any, name: string) => {
    if (name !== "core/cover") {
      return settings;
    }

    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        enableParallax: {
          type: "boolean",
          default: false,
        },
        parallaxSpeed: {
          type: "number",
          default: 0.5,
        },
      },
    };
  }
);

// Add parallax controls to cover block inspector
const withParallaxControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    const { attributes, setAttributes, name } = props;

    if (name !== "core/cover") {
      return <BlockEdit {...props} />;
    }

    const { enableParallax = false, parallaxSpeed = 0.5 } = attributes;

    const handleParallaxToggle = (value: boolean) => {
      setAttributes({ enableParallax: value });

      // Apply/remove parallax class to the block element
      setTimeout(() => {
        const blockElement = document.querySelector(
          `[data-block="${props.clientId}"]`
        ) as HTMLElement;

        if (blockElement) {
          if (value) {
            blockElement.classList.add("enable-parallax");
            blockElement.setAttribute(
              "data-parallax-speed",
              parallaxSpeed.toString()
            );
          } else {
            blockElement.classList.remove("enable-parallax");
            blockElement.removeAttribute("data-parallax-speed");
          }
        } else {
          console.error("❌ Parallax Controls Debug: Block element not found!");
        }
      }, 50);
    };

    const handleSpeedChange = (value: number | undefined) => {
      const newSpeed = value || 0.5;
      setAttributes({ parallaxSpeed: newSpeed });

      // Update speed attribute on block element
      setTimeout(() => {
        const blockElement = document.querySelector(
          `[data-block="${props.clientId}"]`
        ) as HTMLElement;
        if (blockElement && enableParallax) {
          blockElement.setAttribute("data-parallax-speed", newSpeed.toString());
        }
      }, 50);
    };

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
                "Creates a scrolling depth effect where the background moves slower than the content.",
                "kotlinskidev"
              )}
              checked={enableParallax}
              onChange={handleParallaxToggle}
            />

            {enableParallax && (
              <RangeControl
                label={__("Parallax Speed", "kotlinskidev")}
                value={parallaxSpeed}
                onChange={handleSpeedChange}
                min={0.1}
                max={1.0}
                step={0.1}
                help={__(
                  "Lower values create stronger parallax effect. 0.1 = very slow, 1.0 = normal speed",
                  "kotlinskidev"
                )}
              />
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withParallaxControls");

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/cover-parallax-controls",
  withParallaxControls
);
