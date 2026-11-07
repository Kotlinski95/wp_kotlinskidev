import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type OfferTableAttributes } from "./edit";

registerBlockType(metadata as unknown as BlockConfiguration<OfferTableAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
