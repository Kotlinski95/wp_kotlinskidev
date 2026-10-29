import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type IconAttributes } from "./edit";

registerBlockType(metadata as unknown as BlockConfiguration<IconAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
