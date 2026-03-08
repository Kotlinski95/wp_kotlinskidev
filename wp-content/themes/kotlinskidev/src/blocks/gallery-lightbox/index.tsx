import { registerBlockType, type BlockSupports } from "@wordpress/blocks";
import Edit from "./edit";
import Save from "./save";
import "./style.scss";

interface ExtendedBlockSupports extends BlockSupports {
  __experimentalBorder?: {
    radius?: boolean;
    color?: boolean;
    style?: boolean;
    width?: boolean;
  };
  shadow?: boolean;
}

registerBlockType("kotlinskidev/gallery-lightbox", {
  title: "Gallery Lightbox",
  icon: "format-gallery",
  category: "media",
  supports: {
    align: true,
    __experimentalBorder: {
      radius: true,
    },
    shadow: true,
  } as ExtendedBlockSupports,
  attributes: {
    images: { type: "array", default: [] },
    showArrows: { type: "boolean", default: true },
    showPagination: { type: "boolean", default: true },
    loop: { type: "boolean", default: true },
    autoplay: { type: "boolean", default: false },
    autoplayDelay: { type: "number", default: 3000 },
    lazyLoad: { type: "boolean", default: false },
    arrowsPosition: { type: "string", default: "sides" },
    navColor: { type: "string", default: "" },
    navPlacement: { type: "string", default: "inside" },
    trackActiveSlide: { type: "boolean", default: false },
    videoControls: { type: "boolean", default: true },
    videoAutoplay: { type: "boolean", default: false },
    videoLoop: { type: "boolean", default: false },
    videoMuted: { type: "boolean", default: false },
    useMobileMedia: { type: "boolean", default: false },
    mobileImages: { type: "array", default: [] },
  },
  edit: Edit,
  save: Save,
});
