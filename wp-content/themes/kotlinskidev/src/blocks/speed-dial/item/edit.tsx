import React from "react";
import { InnerBlocks, useBlockProps } from "@wordpress/block-editor";

interface ItemAttributes {
  action: string;
  label: string;
}

interface EditProps {
  attributes: ItemAttributes;
}

export default function Edit({ attributes }: Readonly<EditProps>) {
  return (
    <div {...useBlockProps({ className: "kt-speed-dial__item" })}>
      {"custom" === attributes.action ? (
        <InnerBlocks />
      ) : (
        <span>{attributes.label || attributes.action}</span>
      )}
    </div>
  );
}
