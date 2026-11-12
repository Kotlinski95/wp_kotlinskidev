import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import Edit, { type GoogleMapsBlockAttributes } from "./edit";
import metadata from "./block.json";
import "./style.scss";

registerBlockType(metadata as unknown as BlockConfiguration<GoogleMapsBlockAttributes>, {
  edit: Edit,
});
