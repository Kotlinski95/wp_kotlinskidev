import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, ComboboxControl, ToggleControl, RangeControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";
import { Fragment } from "@wordpress/element";
import React from "react";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

interface CanvasSceneRecord {
  id: number;
  title: { rendered: string };
}

interface BlockSettings {
  name: string;
  attributes?: Record<string, unknown>;
}

interface CanvasBackgroundAttributes {
  canvasSceneId?: number;
  canvasScrim?: boolean;
  canvasScrimColor?: string;
  canvasScrimOpacity?: number;
}

interface BlockEditProps {
  name: string;
  attributes: CanvasBackgroundAttributes;
  setAttributes: (attrs: Partial<CanvasBackgroundAttributes>) => void;
}

const canvasLayerBlocks = [
  "kotlinskidev/canvas-layer-gradient",
  "kotlinskidev/canvas-layer-noise",
  "kotlinskidev/canvas-layer-grid-lines",
  "kotlinskidev/canvas-layer-blob",
  "kotlinskidev/canvas-layer-sweep",
  "kotlinskidev/canvas-layer-light-rays",
  "kotlinskidev/canvas-layer-curved-rays",
  "kotlinskidev/canvas-layer-star-field",
  "kotlinskidev/canvas-layer-orbit-trails",
  "kotlinskidev/canvas-layer-warp-field",
  "kotlinskidev/canvas-layer-nebula",
  "kotlinskidev/canvas-layer-aurora",
  "kotlinskidev/canvas-layer-neon-waves",
];

const canvasBackgroundSupportedDynamicBlocks = ["kotlinskidev/certificate"];
const excludedDynamicPreviewBlocks = DYNAMIC_PREVIEW_BLOCKS.filter(
  (name) => !canvasBackgroundSupportedDynamicBlocks.includes(name)
);

const excludedBlocks = [
  "core/html",
  "core/code",
  "core/preformatted",
  "core/verse",
  ...canvasLayerBlocks,
  ...excludedDynamicPreviewBlocks,
];

function addCanvasBackgroundAttribute(settings: BlockSettings) {
  if (excludedBlocks.includes(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      canvasSceneId: {
        type: "number",
        default: 0,
      },
      canvasScrim: {
        type: "boolean",
        default: false,
      },
      canvasScrimColor: {
        type: "string",
        default: "#000000",
      },
      canvasScrimOpacity: {
        type: "number",
        default: 0.5,
      },
    };
  }

  return settings;
}

const withCanvasBackgroundControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    const { attributes, setAttributes, name } = props;
    const canvasSceneId = attributes.canvasSceneId ?? 0;
    const canvasScrim = attributes.canvasScrim ?? false;
    const canvasScrimColor = attributes.canvasScrimColor ?? "#000000";
    const canvasScrimOpacity = attributes.canvasScrimOpacity ?? 0.5;

    const scenes = useSelect<CanvasSceneRecord[]>(
      (select) =>
        (
          select("core") as {
            getEntityRecords: (
              kind: string,
              type: string,
              query: Record<string, unknown>
            ) => CanvasSceneRecord[] | null;
          }
        ).getEntityRecords("postType", "kt_canvas_scene", {
          per_page: -1,
          status: "publish",
          orderby: "title",
          order: "asc",
          _fields: ["id", "title"],
        }) ?? [],
      []
    );

    if (excludedBlocks.includes(name)) {
      return <BlockEdit {...props} />;
    }

    const options = scenes.map((scene) => ({
      value: String(scene.id),
      label: scene.title.rendered || __("(no title)", "kotlinskidev"),
    }));

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Canvas Background", "kotlinskidev")} icon="art" initialOpen={false}>
            <ComboboxControl
              key={`${canvasSceneId}-${options.length}`}
              label={__("Canvas Scene", "kotlinskidev")}
              value={canvasSceneId ? String(canvasSceneId) : ""}
              options={options}
              onChange={(value) => setAttributes({ canvasSceneId: value ? Number(value) : 0 })}
              allowReset
              help={__(
                "Manage scenes from Canvas Scenes in the admin menu. Editing a scene there updates every block using it, with no code changes needed.",
                "kotlinskidev"
              )}
            />
            {canvasSceneId > 0 && (
              <>
                <ToggleControl
                  label={__("Text backdrop", "kotlinskidev")}
                  checked={canvasScrim}
                  onChange={(value) => setAttributes({ canvasScrim: value })}
                  help={__(
                    "Adds a semi-transparent overlay between the animation and the content, to keep text readable.",
                    "kotlinskidev"
                  )}
                  __nextHasNoMarginBottom
                />
                {canvasScrim && (
                  <>
                    <RangeControl
                      label={__("Backdrop opacity", "kotlinskidev")}
                      value={canvasScrimOpacity}
                      onChange={(value) => setAttributes({ canvasScrimOpacity: value ?? 0.5 })}
                      min={0}
                      max={1}
                      step={0.05}
                      __nextHasNoMarginBottom
                    />
                    <ColorGradientControl
                      label={__("Backdrop color", "kotlinskidev")}
                      colorValue={canvasScrimColor || undefined}
                      onColorChange={(value: string | undefined) =>
                        setAttributes({ canvasScrimColor: value || "#000000" })
                      }
                      gradients={[]}
                      disableCustomGradients
                      clearable={false}
                      __experimentalIsRenderedInSidebar
                      __nextHasNoMarginBottom
                    />
                  </>
                )}
              </>
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withCanvasBackgroundControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/canvas-background-attribute",
  addCanvasBackgroundAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/canvas-background-controls",
  withCanvasBackgroundControls
);
