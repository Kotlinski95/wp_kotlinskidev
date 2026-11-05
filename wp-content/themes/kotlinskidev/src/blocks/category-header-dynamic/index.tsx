import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import ServerSideRender from "@wordpress/server-side-render";

export function Edit() {
  const blockProps = useBlockProps();
  return (
    <div {...blockProps}>
      <ServerSideRender block="kotlinskidev/category-header-dynamic" />
    </div>
  );
}

registerBlockType("kotlinskidev/category-header-dynamic", {
  title: "Category Header (Dynamic)",
  category: "kotlinskidev",
  attributes: {},
  edit: Edit,
  save() {
    return null;
  },
});
