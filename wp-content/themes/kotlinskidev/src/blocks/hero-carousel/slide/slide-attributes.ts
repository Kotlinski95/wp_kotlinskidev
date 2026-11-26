export interface HeroSlideAttributes {
  bgImageUrl: string;
  bgImageId: number;
  bgVideoUrl: string;
  bgVideoId: number;
  bgVideoAlphaUrl: string;
  bgVideoAlphaId: number;
  bgOverlay: number;
  style?: { spacing?: Record<string, unknown> };
}

export interface HeroSlideEditProps {
  attributes: HeroSlideAttributes;
  setAttributes: (attrs: Partial<HeroSlideAttributes>) => void;
}

export interface WPMediaItem {
  id: number;
  url: string;
}
