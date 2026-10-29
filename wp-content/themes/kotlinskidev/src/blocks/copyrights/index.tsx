import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import ServerSideRender from "@wordpress/server-side-render";

export function Edit() {
  const blockProps = useBlockProps();
  return (
    <div {...blockProps}>
      <ServerSideRender block="kotlinskidev/copyrights" />
    </div>
  );
}

registerBlockType("kotlinskidev/copyrights", {
  title: "Copyrights",
  category: "kotlinskidev",
  attributes: {},
  edit: Edit,
  save() {
    return null;
  },
});
