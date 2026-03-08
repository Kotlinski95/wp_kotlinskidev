import { registerBlockType } from "@wordpress/blocks";
import Edit from "./edit";
import Save from "./save";
import "./style.scss";

registerBlockType("kotlinskidev/banner-carousel", {
  title: "Banner Carousel",
  icon: "images-alt2",
  category: "media",
  attributes: {
    images: { type: "array", default: [] },
    showArrows: { type: "boolean", default: true },
    showPagination: { type: "boolean", default: true },
    showScrollbar: { type: "boolean", default: false },
    loop: { type: "boolean", default: false },
    autoplay: { type: "boolean", default: false },
    autoplayDelay: { type: "number", default: 3000 },
    lazyLoad: { type: "boolean", default: false },
    arrowsPosition: { type: "string", default: "sides" },
    navColor: { type: "string", default: "" },
    navPlacement: { type: "string", default: "inside" },
    slidesPerView: { type: "number", default: 1 },
    slidesPerMobile: { type: "number", default: 1 },
    slidesPerTablet: { type: "number", default: 1 },
    slidesPerDesktop: { type: "number", default: 1 },
  },
  edit: Edit,
  save: Save,
});
