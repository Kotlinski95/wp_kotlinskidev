import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import "./style.scss";
import Edit, { type SliderAttributes } from "./edit";
import save from "./save";
import metadata from "./block.json";

registerBlockType(metadata as unknown as BlockConfiguration<SliderAttributes>, {
  edit: Edit,
  save,
});
