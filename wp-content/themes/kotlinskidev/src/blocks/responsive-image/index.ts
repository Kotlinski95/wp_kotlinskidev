import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import Edit, { type ResponsiveImageAttributes } from "./edit";
import save from "./save";
import metadata from "./block.json";
import "./style.scss";

registerBlockType(metadata as unknown as BlockConfiguration<ResponsiveImageAttributes>, {
  edit: Edit,
  save,
});
