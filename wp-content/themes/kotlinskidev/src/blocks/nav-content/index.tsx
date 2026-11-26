import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import paragraphMetadata from "../nav-paragraph/block.json";
import imageMetadata from "../nav-image/block.json";
import bannerMetadata from "../nav-banner/block.json";
import linkMetadata from "../nav-link/block.json";
import { NavParagraphEdit } from "./nav-paragraph-edit";
import { NavImageEdit } from "./nav-image-edit";
import { NavBannerEdit } from "./nav-banner-edit";
import { NavLinkEdit } from "./nav-link-edit";
import type {
  NavBannerAttributes,
  NavImageAttributes,
  NavLinkAttributes,
  NavParagraphAttributes,
} from "./types";

export type {
  NavBannerAttributes,
  NavImageAttributes,
  NavLinkAttributes,
  NavParagraphAttributes,
} from "./types";
export { NavParagraphEdit, NavImageEdit, NavBannerEdit, NavLinkEdit };

function Save() {
  return null;
}

registerBlockType(paragraphMetadata as unknown as BlockConfiguration<NavParagraphAttributes>, {
  edit: NavParagraphEdit,
  save: Save,
});

registerBlockType(imageMetadata as unknown as BlockConfiguration<NavImageAttributes>, {
  edit: NavImageEdit,
  save: Save,
});

registerBlockType(bannerMetadata as unknown as BlockConfiguration<NavBannerAttributes>, {
  edit: NavBannerEdit,
  save: Save,
});

registerBlockType(linkMetadata as unknown as BlockConfiguration<NavLinkAttributes>, {
  edit: NavLinkEdit,
  save: Save,
});
