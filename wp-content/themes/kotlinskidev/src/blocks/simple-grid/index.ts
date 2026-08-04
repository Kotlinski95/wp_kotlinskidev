import { registerBlockType, getBlockType, type BlockConfiguration } from "@wordpress/blocks";
import domReady from "@wordpress/dom-ready";
import metadata from "./block.json";
import holderMetadata from "../holder/block.json";
import Edit from "./edit";
import Save from "./save";
import HolderEdit from "../holder/edit";
import HolderSave from "../holder/save";

registerBlockType(holderMetadata as unknown as BlockConfiguration<Record<string, never>>, {
  edit: HolderEdit,
  save: HolderSave,
});

registerBlockType(metadata as unknown as BlockConfiguration<Record<string, never>>, {
  edit: Edit,
  save: Save,
});

domReady(() => {
  ["core/navigation-link", "core/navigation-submenu"].forEach((blockName) => {
    const blockType = getBlockType(blockName) as { parent?: string[] } | undefined;
    if (!blockType) return;
    if (!blockType.parent) {
      blockType.parent = ["kotlinskidev/holder"];
    } else if (!blockType.parent.includes("kotlinskidev/holder")) {
      blockType.parent.push("kotlinskidev/holder");
    }
  });
});
