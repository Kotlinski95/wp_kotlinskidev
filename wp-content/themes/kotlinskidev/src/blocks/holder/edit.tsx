import React from "react";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function Edit() {
  const blockProps = useBlockProps({ className: "kt-holder" });
  return (
    <div {...blockProps}>
      <InnerBlocks templateLock={false} />
    </div>
  );
}
