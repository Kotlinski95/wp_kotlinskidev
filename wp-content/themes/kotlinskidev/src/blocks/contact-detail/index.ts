import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type ContactDetailAttributes } from "./edit";

registerBlockType(metadata as unknown as BlockConfiguration<ContactDetailAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
