import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import itemMetadata from "./item/block.json";
import Edit from "./edit";
import Save from "./save";
import ItemEdit from "./item/edit";

registerBlockType(itemMetadata as unknown as BlockConfiguration<Record<string, never>>, {
  edit: ItemEdit,
  save: () => null,
});

registerBlockType(metadata as unknown as BlockConfiguration<Record<string, never>>, {
  edit: Edit,
  save: Save,
});
