import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import Edit, { type BreadcrumbsAttributes } from "./edit";
import metadata from "./block.json";
import "./style.scss";

registerBlockType(metadata as unknown as BlockConfiguration<BreadcrumbsAttributes>, {
  edit: Edit,
});
