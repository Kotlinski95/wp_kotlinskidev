import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type DeviceFrameAttributes } from "./edit";

registerBlockType(metadata as unknown as BlockConfiguration<DeviceFrameAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
