import React from "react";
import { useBlockProps, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { PanelBody, Button, SelectControl, ColorPalette } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import "./style.scss";

const ALLOWED_BLOCKS = ["kotlinskidev/scroll-section-item"];
const ITEMS_TEMPLATE: [string, Record<string, unknown>][] = [
  ["kotlinskidev/scroll-section-item", {}],
  ["kotlinskidev/scroll-section-item", {}],
];

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: Array<{ clientId: string }> } | undefined;
}

interface BlockEditorActions {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
}

type TriggerValue = "top" | "center" | "bottom";

interface ScrollSectionAttributes {
  trigger: TriggerValue;
  backgroundColor: string;
}

export default function Edit({
  clientId,
  attributes,
  setAttributes,
}: {
  clientId: string;
  attributes: ScrollSectionAttributes;
  setAttributes: (attrs: Partial<ScrollSectionAttributes>) => void;
}) {
  const { innerBlocks } = useSelect(
    (select) => ({
      innerBlocks:
        (select("core/block-editor") as unknown as BlockEditorSelectors).getBlock(clientId)
          ?.innerBlocks ?? [],
    }),
    [clientId]
  );

  const { insertBlock, removeBlock } = useDispatch(
    "core/block-editor"
  ) as unknown as BlockEditorActions;

  const handleAddItem = () => {
    insertBlock(createBlock("kotlinskidev/scroll-section-item"), undefined, clientId);
  };

  const handleRemoveLast = () => {
    if (innerBlocks.length <= 1) return;
    const last = innerBlocks[innerBlocks.length - 1];
    if (last) removeBlock(last.clientId);
  };

  const editorStyle = attributes.backgroundColor
    ? { background: attributes.backgroundColor }
    : undefined;

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Behaviour", "kotlinskidev")} initialOpen>
          <SelectControl
            label={__("Trigger point", "kotlinskidev")}
            value={attributes.trigger}
            options={[
              { label: __("Bottom of screen", "kotlinskidev"), value: "bottom" as TriggerValue },
              { label: __("Center of screen", "kotlinskidev"), value: "center" as TriggerValue },
              { label: __("Top of screen", "kotlinskidev"), value: "top" as TriggerValue },
            ]}
            onChange={(value: string) =>
              setAttributes({ trigger: value as TriggerValue })
            }
          />
        </PanelBody>
        <PanelBody title={__("Background", "kotlinskidev")}>
          <ColorPalette
            value={attributes.backgroundColor || undefined}
            onChange={(value: string | undefined) =>
              setAttributes({ backgroundColor: value ?? "" })
            }
          />
        </PanelBody>
        <PanelBody title={__("Items", "kotlinskidev")} initialOpen>
          <p className="scroll-section-sidebar__count">
            {innerBlocks.length} {__("item(s)", "kotlinskidev")}
          </p>
          <Button
            variant="secondary"
            onClick={handleAddItem}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {__("+ Add Item", "kotlinskidev")}
          </Button>
          {innerBlocks.length > 1 && (
            <Button
              variant="tertiary"
              isDestructive
              onClick={handleRemoveLast}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              {__("Remove Last Item", "kotlinskidev")}
            </Button>
          )}
        </PanelBody>
      </InspectorControls>

      <div
        {...useBlockProps({ className: "scroll-section scroll-section--editor" })}
        style={editorStyle}
      >
        <div className="scroll-section__track scroll-section__track--editor">
          <InnerBlocks
            allowedBlocks={ALLOWED_BLOCKS}
            template={ITEMS_TEMPLATE}
            renderAppender={() => null}
          />
        </div>
        <button
          className="scroll-section-editor__add"
          onClick={handleAddItem}
          title={__("Add item", "kotlinskidev")}
          type="button"
        >
          +
        </button>
      </div>
    </>
  );
}
