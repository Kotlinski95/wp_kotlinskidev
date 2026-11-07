import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import React, { Fragment } from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";

const SUPPORTED_BLOCKS = ["core/button"];
const OVERLAY_CLASS = "kt-overlay-link";
const HIDE_LABEL_CLASS = "kt-overlay-link--label-hidden";

interface BlockEditProps {
  name: string;
  attributes: { className?: string; [key: string]: unknown };
  setAttributes: (attributes: { className?: string }) => void;
  [key: string]: unknown;
}

const splitClasses = (className?: string): string[] =>
  (className ?? "").split(/\s+/).filter(Boolean);

export const withClassState = (
  className: string | undefined,
  token: string,
  enabled: boolean
): string | undefined => {
  const without = splitClasses(className).filter((existing) => existing !== token);
  const next = enabled ? [...without, token] : without;
  return next.length > 0 ? next.join(" ") : undefined;
};

const withOverlayLinkControls = createHigherOrderComponent(
  (BlockEdit: React.ComponentType<BlockEditProps>) => {
    const OverlayLinkControls = (props: BlockEditProps) => {
      const { name, attributes, setAttributes } = props;

      if (!SUPPORTED_BLOCKS.includes(name)) {
        return <BlockEdit {...props} />;
      }

      const classes = splitClasses(attributes.className);
      const isOverlay = classes.includes(OVERLAY_CLASS);
      const isLabelHidden = classes.includes(HIDE_LABEL_CLASS);

      const setOverlay = (enabled: boolean) => {
        const withOverlay = withClassState(attributes.className, OVERLAY_CLASS, enabled);
        setAttributes({
          className: enabled ? withOverlay : withClassState(withOverlay, HIDE_LABEL_CLASS, false),
        });
      };

      return (
        <Fragment>
          <BlockEdit {...props} />
          <InspectorControls>
            <PanelBody title={__("Overlay link", "kotlinskidev")} initialOpen={isOverlay}>
              <ToggleControl
                label={__("Stretch over container", "kotlinskidev")}
                help={__(
                  "Makes this button's link clickable across the whole Cover, or the whole block marked Overlay Link Host, that it sits in.",
                  "kotlinskidev"
                )}
                checked={isOverlay}
                onChange={setOverlay}
              />
              <ToggleControl
                label={__("Hide label", "kotlinskidev")}
                help={__(
                  "Hides the button text visually but keeps it for screen readers.",
                  "kotlinskidev"
                )}
                checked={isLabelHidden}
                disabled={!isOverlay}
                onChange={(enabled: boolean) =>
                  setAttributes({
                    className: withClassState(attributes.className, HIDE_LABEL_CLASS, enabled),
                  })
                }
              />
            </PanelBody>
          </InspectorControls>
        </Fragment>
      );
    };
    return OverlayLinkControls;
  },
  "withOverlayLinkControls"
);

addFilter("editor.BlockEdit", "kotlinskidev/overlay-link-controls", withOverlayLinkControls);
