import React from "react";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

const ALLOWED_BLOCKS = [
  "core/navigation-link",
  "core/navigation-submenu",
  "core/page-list",
  "core/paragraph",
  "core/heading",
  "core/image",
  "core/list",
  "core/list-item",
  "core/buttons",
  "core/button",
  "core/group",
  "core/columns",
  "core/separator",
  "core/spacer",
  "core/media-text",
  "core/cover",
  "core/html",
  "kotlinskidev/popular-pages",
  "kotlinskidev/nav-popular-pages",
  "kotlinskidev/simple-grid",
  "kotlinskidev/nav-paragraph",
  "kotlinskidev/nav-image",
  "kotlinskidev/nav-banner",
];

export default function Edit() {
  const blockProps = useBlockProps({ className: "kt-holder" });
  return (
    <div {...blockProps}>
      <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} templateLock={false} />
    </div>
  );
}
