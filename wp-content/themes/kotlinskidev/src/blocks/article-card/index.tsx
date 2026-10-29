import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import ArticleCardEdit, { type ArticleCardAttributes } from "./edit";

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<ArticleCardAttributes>, {
  edit: ArticleCardEdit,
  save: Save,
});
