import React from "react";
import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["kotlinskidev/speed-dial-item"];

const TEMPLATE: [string, Record<string, string>][] = [
  ["kotlinskidev/speed-dial-item", { action: "phone" }],
  ["kotlinskidev/speed-dial-item", { action: "email" }],
  ["kotlinskidev/speed-dial-item", { action: "accessibility" }],
];

export default function Edit() {
  return (
    <div {...useBlockProps({ className: "kt-speed-dial" })}>
      <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} template={TEMPLATE} orientation="vertical" />
    </div>
  );
}
