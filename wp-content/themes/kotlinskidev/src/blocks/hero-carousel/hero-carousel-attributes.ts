import type { CarouselSettings } from "@utils/carousel/types";

export interface HeroCarouselAttributes extends Partial<CarouselSettings> {
  minHeight: number;
}

export interface HeroCarouselEditProps {
  attributes: HeroCarouselAttributes;
  setAttributes: (attrs: Partial<HeroCarouselAttributes>) => void;
  clientId: string;
}
