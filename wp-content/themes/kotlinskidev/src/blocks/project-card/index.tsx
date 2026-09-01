import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import ProjectCardEdit, { type ProjectCardAttributes } from "./edit";

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<ProjectCardAttributes>, {
  edit: ProjectCardEdit,
  save: Save,
});
