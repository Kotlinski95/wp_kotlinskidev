import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type ArticleTocAttributes } from "./edit";
import "./style.scss";

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<ArticleTocAttributes>, {
  edit: Edit,
  save: Save,
});
