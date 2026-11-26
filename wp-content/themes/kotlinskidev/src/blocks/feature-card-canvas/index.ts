import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type FeatureCardCanvasAttributes } from "./edit";
import "./style.scss";

registerBlockType(metadata as unknown as BlockConfiguration<FeatureCardCanvasAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
