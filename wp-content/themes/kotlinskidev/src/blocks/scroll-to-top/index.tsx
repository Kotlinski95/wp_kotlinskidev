import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

function Edit() {
  const blockProps = useBlockProps({ className: "kt-editor-placeholder" });
  return (
    <div {...blockProps}>
      <span className="kt-editor-placeholder__icon" aria-hidden="true">
        ↑
      </span>
      <span className="kt-editor-placeholder__label">{__("Scroll To Top", "kotlinskidev")}</span>
      <span className="kt-editor-placeholder__hint">
        {__("Fixed button, visible on the frontend while scrolling", "kotlinskidev")}
      </span>
    </div>
  );
}

registerBlockType("kotlinskidev/scroll-to-top", {
  title: "Scroll To Top",
  category: "kotlinskidev",
  attributes: {},
  edit: Edit,
  save() {
    return null;
  },
});
