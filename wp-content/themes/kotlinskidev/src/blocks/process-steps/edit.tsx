import React from "react";
import { useBlockProps, useInnerBlocksProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useBlockItems } from "../shared/use-block-items";
import "./style.scss";

const ITEM_BLOCK = "kotlinskidev/process-step";
const ALLOWED_BLOCKS = [ITEM_BLOCK];
const ITEMS_TEMPLATE: [string, Record<string, unknown>][] = [
  [ITEM_BLOCK, {}],
  [ITEM_BLOCK, {}],
  [ITEM_BLOCK, {}],
];

function StepsPanel({
  stepCount,
  onAddStep,
  onRemoveLastStep,
}: {
  stepCount: number;
  onAddStep: () => void;
  onRemoveLastStep: () => void;
}) {
  return (
    <PanelBody title={__("Steps", "kotlinskidev")} initialOpen>
      <p className="process-steps-sidebar__count">
        {stepCount} {__("step(s)", "kotlinskidev")}
      </p>
      <Button
        variant="secondary"
        onClick={onAddStep}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {__("+ Add Step", "kotlinskidev")}
      </Button>
      {stepCount > 1 && (
        <Button
          variant="tertiary"
          isDestructive
          onClick={onRemoveLastStep}
          style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
        >
          {__("Remove Last Step", "kotlinskidev")}
        </Button>
      )}
    </PanelBody>
  );
}

export default function Edit({ clientId }: { clientId: string }) {
  const blockProps = useBlockProps({ className: "process-steps" });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    allowedBlocks: ALLOWED_BLOCKS,
    template: ITEMS_TEMPLATE,
    renderAppender: () => null,
  });
  const { itemCount, addItem, removeLastItem } = useBlockItems(clientId, ITEM_BLOCK);

  return (
    <>
      <InspectorControls>
        <StepsPanel stepCount={itemCount} onAddStep={addItem} onRemoveLastStep={removeLastItem} />
      </InspectorControls>

      <div {...innerBlocksProps} />
    </>
  );
}
