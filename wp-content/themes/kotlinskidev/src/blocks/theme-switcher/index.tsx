import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import ServerSideRender from "@wordpress/server-side-render";

registerBlockType("kotlinskidev/theme-switcher", {
  title: "Theme Switcher",
  category: "kotlinskidev",
  attributes: {},
  edit() {
    const blockProps = useBlockProps({
      style: { display: "inline-flex", alignItems: "center" },
    });
    return (
      <div {...blockProps}>
        <ServerSideRender block="kotlinskidev/theme-switcher" />
      </div>
    );
  },
  save() {
    return null;
  },
});
