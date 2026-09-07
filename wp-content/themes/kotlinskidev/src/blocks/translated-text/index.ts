import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type TranslatedTextAttributes } from "./edit";

registerBlockType(metadata as unknown as BlockConfiguration<TranslatedTextAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
