import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import CertificateEdit, { type CertificateAttributes } from "./edit";

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<CertificateAttributes>, {
  edit: CertificateEdit,
  save: Save,
});
