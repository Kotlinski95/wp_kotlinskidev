import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import React, { Fragment } from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";

interface CoverVideoAttributes {
  backgroundType?: string;
  coverVideoAutoplay?: boolean;
  coverVideoLoop?: boolean;
  coverVideoPauseOffscreen?: boolean;
  coverVideoRevealAfterEnd?: boolean;
  coverVideoFitAspect?: boolean;
  [key: string]: unknown;
}

interface BlockEditProps {
  attributes: CoverVideoAttributes;
  setAttributes: (attributes: Partial<CoverVideoAttributes>) => void;
  name: string;
  [key: string]: unknown;
}

interface BlockSettings {
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const COVER_BLOCK = "core/cover";

const addCoverVideoAttributes = (settings: BlockSettings, name: string): BlockSettings => {
  if (name !== COVER_BLOCK) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      coverVideoAutoplay: { type: "boolean", default: true },
      coverVideoLoop: { type: "boolean", default: true },
      coverVideoPauseOffscreen: { type: "boolean", default: false },
      coverVideoRevealAfterEnd: { type: "boolean", default: false },
      coverVideoFitAspect: { type: "boolean", default: false },
    },
  };
};

const withCoverVideoControls = createHigherOrderComponent(
  (BlockEdit: React.ComponentType<BlockEditProps>) => {
    const CoverVideoControls = (props: BlockEditProps) => {
      const { attributes, setAttributes, name } = props;

      if (name !== COVER_BLOCK || attributes.backgroundType !== "video") {
        return <BlockEdit {...props} />;
      }

      const {
        coverVideoAutoplay = true,
        coverVideoLoop = true,
        coverVideoPauseOffscreen = false,
        coverVideoRevealAfterEnd = false,
        coverVideoFitAspect = false,
      } = attributes;

      const loopHelp = (): string => {
        if (coverVideoRevealAfterEnd) {
          return __("Loop is off while content is revealed after the video ends.", "kotlinskidev");
        }
        return coverVideoLoop
          ? __("The video restarts every time it ends.", "kotlinskidev")
          : __("The video plays once and stays on its last frame.", "kotlinskidev");
      };

      return (
        <Fragment>
          <BlockEdit {...props} />
          <InspectorControls>
            <PanelBody title={__("Video background", "kotlinskidev")} initialOpen={false}>
              <ToggleControl
                label={__("Autoplay", "kotlinskidev")}
                help={
                  coverVideoAutoplay
                    ? __("The video starts playing as soon as the page loads.", "kotlinskidev")
                    : __("The video stays on its first frame and does not play.", "kotlinskidev")
                }
                checked={coverVideoAutoplay}
                onChange={(value: boolean) => setAttributes({ coverVideoAutoplay: value })}
              />
              <ToggleControl
                label={__("Loop", "kotlinskidev")}
                disabled={coverVideoRevealAfterEnd}
                help={loopHelp()}
                checked={coverVideoLoop && !coverVideoRevealAfterEnd}
                onChange={(value: boolean) => setAttributes({ coverVideoLoop: value })}
              />
              <ToggleControl
                label={__("Pause when offscreen", "kotlinskidev")}
                help={__(
                  "Pauses the video while it is scrolled out of view and resumes it when it returns. Saves battery and bandwidth.",
                  "kotlinskidev"
                )}
                checked={coverVideoPauseOffscreen}
                onChange={(value: boolean) => setAttributes({ coverVideoPauseOffscreen: value })}
              />
              <ToggleControl
                label={__("Reveal content after video ends", "kotlinskidev")}
                help={__(
                  "Keeps the cover content hidden until the video finishes playing, then animates it in. Turns Loop off.",
                  "kotlinskidev"
                )}
                checked={coverVideoRevealAfterEnd}
                onChange={(value: boolean) => setAttributes({ coverVideoRevealAfterEnd: value })}
              />
              <ToggleControl
                label={__("Fit cover to video aspect ratio", "kotlinskidev")}
                help={__(
                  "Shows the whole video. The cover takes the video's width-to-height ratio on each device; add a vertical video in Responsive media for phones.",
                  "kotlinskidev"
                )}
                checked={coverVideoFitAspect}
                onChange={(value: boolean) => setAttributes({ coverVideoFitAspect: value })}
              />
            </PanelBody>
          </InspectorControls>
        </Fragment>
      );
    };
    return CoverVideoControls;
  },
  "withCoverVideoControls"
);

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/cover-video-controls-attributes",
  addCoverVideoAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/cover-video-controls", withCoverVideoControls);
