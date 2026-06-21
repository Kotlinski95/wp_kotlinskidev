import React from "react";
import { useBlockProps, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { PanelBody, Button, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import "./style.scss";

const ALLOWED_BLOCKS = ["kotlinskidev/holder"];

const TEMPLATE: [string, Record<string, unknown>][] = [
  ["kotlinskidev/holder", {}],
  ["kotlinskidev/holder", {}],
];

interface BlockEditorStore {
  getBlock: (id: string) => { innerBlocks: Array<{ clientId: string }> } | undefined;
}

interface BlockEditorDispatch {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
}

interface SimpleGridAttributes {
  label: string;
}

export default function Edit({
  clientId,
  attributes,
  setAttributes,
}: {
  clientId: string;
  attributes: SimpleGridAttributes;
  setAttributes: (attrs: Partial<SimpleGridAttributes>) => void;
}) {
  const { innerBlocks } = useSelect(
    (select) => ({
      innerBlocks:
        (select("core/block-editor") as unknown as BlockEditorStore).getBlock(clientId)
          ?.innerBlocks ?? [],
    }),
    [clientId]
  );

  const { insertBlock, removeBlock } = useDispatch(
    "core/block-editor"
  ) as unknown as BlockEditorDispatch;

  const onAddHolder = () => {
    insertBlock(createBlock("kotlinskidev/holder"), undefined, clientId);
  };

  const onRemoveLast = () => {
    if (innerBlocks.length <= 1) return;
    const last = innerBlocks[innerBlocks.length - 1];
    if (last) removeBlock(last.clientId);
  };

  const colCount = Math.max(1, innerBlocks.length);

  const blockProps = useBlockProps({
    className: "kt-simple-grid",
    style: { "--kt-sg-cols": colCount } as React.CSSProperties,
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Navigation", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Nav label", "kotlinskidev")}
            value={attributes.label}
            onChange={(label) => setAttributes({ label })}
            help={__("Label shown in the navigation bar trigger.", "kotlinskidev")}
          />
        </PanelBody>
        <PanelBody title={__("Columns", "kotlinskidev")}>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem" }}>
            {colCount} {__("column(s)", "kotlinskidev")}
          </p>
          <Button
            variant="secondary"
            onClick={onAddHolder}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {__("+ Add Column", "kotlinskidev")}
          </Button>
          {innerBlocks.length > 1 && (
            <Button
              variant="tertiary"
              isDestructive
              onClick={onRemoveLast}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              {__("Remove Last Column", "kotlinskidev")}
            </Button>
          )}
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} template={TEMPLATE} templateLock={false} />
      </div>
    </>
  );
}
