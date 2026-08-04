import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import ButtonEdit, { type ButtonAttributes } from "./edit";

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<ButtonAttributes>, {
  edit: ButtonEdit,
  save: Save,
});
