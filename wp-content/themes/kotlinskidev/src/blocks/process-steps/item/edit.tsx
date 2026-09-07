import React from "react";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

const ITEM_TEMPLATE: [string, object][] = [
  ["core/heading", { level: 3, fontSize: "medium", placeholder: "Step title" }],
  ["core/paragraph", { placeholder: "Step description" }],
  ["core/paragraph", { placeholder: "Duration (optional)", fontSize: "small" }],
];

export default function Edit() {
  return (
    <div {...useBlockProps({ className: "process-step" })}>
      <div className="process-step__marker">
        <span className="process-step__number" />
      </div>
      <div className="process-step__body">
        <InnerBlocks template={ITEM_TEMPLATE} />
      </div>
    </div>
  );
}
