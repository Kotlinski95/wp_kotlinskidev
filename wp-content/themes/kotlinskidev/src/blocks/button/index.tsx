import { InnerBlocks } from "@wordpress/block-editor";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import ButtonEdit, { type ButtonAttributes } from "./edit";

function Save({ attributes }: { attributes: ButtonAttributes }) {
  return attributes.useInnerBlocks ? <InnerBlocks.Content /> : null;
}

registerBlockType(metadata as unknown as BlockConfiguration<ButtonAttributes>, {
  edit: ButtonEdit,
  save: Save,
});
