import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit, { type BgEffectPresetSettingsAttributes } from "./edit";

registerBlockType(metadata as unknown as BlockConfiguration<BgEffectPresetSettingsAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});
