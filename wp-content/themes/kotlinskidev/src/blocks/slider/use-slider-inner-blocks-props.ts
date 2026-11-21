import { useInnerBlocksProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import {
  ALLOWED_BLOCKS,
  DEFAULT_BLOCK,
  DEFAULT_BLOCK_ATTRIBUTES,
  DEFAULT_INNERBLOCK,
  DEFAULT_INNERBLOCK_ATTRIBUTES,
} from "./constants";
import PLACEHOLDER_IMG_1 from "./assets/image1.webp";
import PLACEHOLDER_IMG_2 from "./assets/image2.webp";
import PLACEHOLDER_IMG_3 from "./assets/image3.webp";

const buildTemplateSlide = (imageUrl: string) => [
  DEFAULT_BLOCK,
  { url: imageUrl, ...DEFAULT_BLOCK_ATTRIBUTES },
  [
    [
      DEFAULT_INNERBLOCK,
      { placeholder: __("Slide title…", "kotlinskidev"), ...DEFAULT_INNERBLOCK_ATTRIBUTES },
    ],
  ],
];

export function useSliderInnerBlocksProps(spaceBetween: number) {
  return useInnerBlocksProps(
    { className: "swiper-wrapper", style: { gap: `${spaceBetween}px` } },
    {
      allowedBlocks: ALLOWED_BLOCKS,
      defaultBlock: {
        name: DEFAULT_BLOCK,
        attributes: {
          url: `${PLACEHOLDER_IMG_3}`,
          ...DEFAULT_BLOCK_ATTRIBUTES,
        },
      },
      directInsert: true,
      orientation: "horizontal",
      template: [
        buildTemplateSlide(`${PLACEHOLDER_IMG_1}`),
        buildTemplateSlide(`${PLACEHOLDER_IMG_2}`),
      ],
      renderAppender: false,
    }
  );
}
