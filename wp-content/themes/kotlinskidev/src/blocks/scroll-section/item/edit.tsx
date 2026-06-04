import React from "react";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

const ITEM_TEMPLATE: [string, object][] = [
  ["core/heading", { level: 2, placeholder: "Item heading" }],
  ["core/paragraph", { placeholder: "Add content…" }],
];

export default function Edit() {
  return (
    <div {...useBlockProps({ className: "scroll-section__item" })}>
      <InnerBlocks template={ITEM_TEMPLATE} />
    </div>
  );
}
