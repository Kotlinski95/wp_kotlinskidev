import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import slideMetadata from "./slide/block.json";
import Edit, { type HeroCarouselAttributes } from "./edit";
import Save from "./save";
import SlideEdit, { type HeroSlideAttributes } from "./slide/edit";
import SlideSave from "./slide/save";
import "./style.scss";

registerBlockType(slideMetadata as unknown as BlockConfiguration<HeroSlideAttributes>, {
  edit: SlideEdit,
  save: SlideSave,
});

registerBlockType(metadata as unknown as BlockConfiguration<HeroCarouselAttributes>, {
  edit: Edit,
  save: Save,
});
