import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type ModelViewerAttributes } from "./edit";
import "./style.scss";

registerBlockType(metadata as unknown as BlockConfiguration<ModelViewerAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
