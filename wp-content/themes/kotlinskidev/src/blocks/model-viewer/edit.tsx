import React from "react";
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from "@wordpress/block-editor";
import {
  Button,
  Notice,
  PanelBody,
  SelectControl,
  TextControl,
  TextareaControl,
  ToggleControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface ModelViewerAttributes {
  modelId: number;
  modelUrl: string;
  posterId: number;
  posterUrl: string;
  ariaLabel: string;
  clipName: string;
  backgroundColor: string;
  aspectRatio: string;
  enableOrbitControls: boolean;
  screenText: string;
}

interface ModelMedia {
  id: number;
  url: string;
  mime: string;
  filename?: string;
}

interface ImageMedia {
  id: number;
  url: string;
}

interface EditProps {
  attributes: ModelViewerAttributes;
  setAttributes: (attrs: Partial<ModelViewerAttributes>) => void;
}

const ASPECT_RATIO_OPTIONS = [
  { label: __("16:9 (widescreen)", "kotlinskidev"), value: "16/9" },
  { label: __("4:3 (standard)", "kotlinskidev"), value: "4/3" },
  { label: __("1:1 (square)", "kotlinskidev"), value: "1/1" },
  { label: __("21:9 (ultra-wide)", "kotlinskidev"), value: "21/9" },
];

const getFilename = (url: string): string => url.split("/").pop() ?? url;

export default function Edit({ attributes, setAttributes }: EditProps) {
  const {
    modelId,
    modelUrl,
    posterId,
    posterUrl,
    ariaLabel,
    clipName,
    backgroundColor,
    aspectRatio,
    enableOrbitControls,
    screenText,
  } = attributes;

  const blockProps = useBlockProps({ className: "model-viewer-editor" });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Model", "kotlinskidev")} initialOpen>
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media: ModelMedia) =>
                setAttributes({ modelId: media.id, modelUrl: media.url })
              }
              allowedTypes={["model/gltf-binary"]}
              value={modelId}
              render={({ open }: { open: () => void }) => (
                <>
                  {modelUrl && (
                    <p className="model-viewer-editor__filename">{getFilename(modelUrl)}</p>
                  )}
                  <Button variant={modelId ? "secondary" : "primary"} onClick={open}>
                    {modelId
                      ? __("Replace .glb model", "kotlinskidev")
                      : __("Select .glb model", "kotlinskidev")}
                  </Button>
                  {modelId ? (
                    <Button
                      variant="link"
                      isDestructive
                      onClick={() => setAttributes({ modelId: 0, modelUrl: "" })}
                    >
                      {__("Remove model", "kotlinskidev")}
                    </Button>
                  ) : null}
                </>
              )}
            />
          </MediaUploadCheck>
          <p className="model-viewer-editor__help">
            {__(
              'Single-file .glb only, exported with an animation clip baked in (e.g. an "open" Action in Blender). .gltf (multi-file) isn\'t supported.',
              "kotlinskidev"
            )}
          </p>
          <TextControl
            label={__("Animation clip name", "kotlinskidev")}
            help={__(
              "Must match the exact name of the baked animation clip in the .glb file — played forward on click, backward on the next click.",
              "kotlinskidev"
            )}
            value={clipName}
            onChange={(value) => setAttributes({ clipName: value })}
          />
        </PanelBody>

        <PanelBody title={__("Fallback Image", "kotlinskidev")} initialOpen>
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media: ImageMedia) =>
                setAttributes({ posterId: media.id, posterUrl: media.url })
              }
              allowedTypes={["image"]}
              value={posterId}
              render={({ open }: { open: () => void }) => (
                <>
                  {posterUrl && (
                    <img src={posterUrl} alt="" className="model-viewer-editor__poster-preview" />
                  )}
                  <Button variant={posterId ? "secondary" : "primary"} onClick={open}>
                    {posterId
                      ? __("Replace fallback image", "kotlinskidev")
                      : __("Select fallback image", "kotlinskidev")}
                  </Button>
                </>
              )}
            />
          </MediaUploadCheck>
          {!posterUrl && (
            <Notice status="warning" isDismissible={false}>
              {__(
                "A fallback image is required — it's shown while the model loads and if WebGL isn't supported.",
                "kotlinskidev"
              )}
            </Notice>
          )}
        </PanelBody>

        <PanelBody title={__("Accessibility & Layout", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Accessible label", "kotlinskidev")}
            help={__(
              'Describes the interaction for screen reader users, e.g. "Interactive 3D laptop model — click to open or close."',
              "kotlinskidev"
            )}
            value={ariaLabel}
            onChange={(value) => setAttributes({ ariaLabel: value })}
          />
          {!ariaLabel && (
            <Notice status="warning" isDismissible={false}>
              {__(
                "A default label will be used, but a specific one is recommended.",
                "kotlinskidev"
              )}
            </Notice>
          )}
          <SelectControl
            label={__("Aspect ratio", "kotlinskidev")}
            value={aspectRatio}
            options={ASPECT_RATIO_OPTIONS}
            onChange={(value) => setAttributes({ aspectRatio: value })}
          />
          <TextControl
            label={__("Background color", "kotlinskidev")}
            help={__(
              "Any CSS color value, e.g. #1a1a1a. Leave empty for transparent.",
              "kotlinskidev"
            )}
            value={backgroundColor}
            onChange={(value) => setAttributes({ backgroundColor: value })}
          />
        </PanelBody>

        <PanelBody title={__("Interaction", "kotlinskidev")} initialOpen>
          <ToggleControl
            label={__("Enable drag-to-rotate", "kotlinskidev")}
            help={__(
              "Lets visitors drag the model to orbit around it. Works independently of the click-to-toggle animation, so it's useful even for a model with no baked animation clip.",
              "kotlinskidev"
            )}
            checked={enableOrbitControls}
            onChange={(value) => setAttributes({ enableOrbitControls: value })}
          />
          <TextareaControl
            label={__("Screen text", "kotlinskidev")}
            help={__(
              "Rendered onto the model's screen/display surface (auto-detected as its most strongly emissive material) as a texture — e.g. your email and phone number. Leave empty to keep the model's original screen image. One line per line of text.",
              "kotlinskidev"
            )}
            value={screenText}
            onChange={(value) => setAttributes({ screenText: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        {posterUrl ? (
          <img src={posterUrl} alt="" className="model-viewer-editor__poster" />
        ) : (
          <div className="model-viewer-editor__placeholder-icon dashicons dashicons-layout" />
        )}
        <span className="model-viewer-editor__badge">
          {modelUrl
            ? `${__("3D Model", "kotlinskidev")}: ${getFilename(modelUrl)}`
            : __("Model Viewer — select a .glb model", "kotlinskidev")}
        </span>
      </div>
    </>
  );
}
