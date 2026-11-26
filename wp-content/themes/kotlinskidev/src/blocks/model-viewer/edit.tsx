import React from "react";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import type { ModelViewerAttributes } from "./attributes";
import {
  FallbackImagePanel,
  InteractionPanel,
  LayoutPanel,
  ModelPanel,
  getFilename,
} from "./edit-panels";

export type { ModelViewerAttributes } from "./attributes";

interface EditProps {
  attributes: ModelViewerAttributes;
  setAttributes: (attrs: Partial<ModelViewerAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { posterUrl, modelUrl } = attributes;
  const blockProps = useBlockProps({ className: "model-viewer-editor" });
  const panelProps = { attributes, setAttributes };

  return (
    <>
      <InspectorControls>
        <ModelPanel {...panelProps} />
        <FallbackImagePanel {...panelProps} />
        <LayoutPanel {...panelProps} />
        <InteractionPanel {...panelProps} />
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
