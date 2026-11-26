import type { CarouselSettings } from "@utils/carousel/types";

export interface GalleryMedia {
  id: number;
  url: string;
  thumbnailUrl: string;
  alt: string;
  caption: string;
  type: "image" | "video";
  poster: string;
  width: number;
  height: number;
}

export interface GalleryLightboxAttributes extends Partial<CarouselSettings> {
  images: GalleryMedia[];
  videoControls: boolean;
  videoAutoplay: boolean;
  videoLoop: boolean;
  videoMuted: boolean;
  useMobileMedia: boolean;
  mobileImages: GalleryMedia[];
  lockHeight: boolean;
}

export interface GalleryEditProps {
  attributes: GalleryLightboxAttributes;
  setAttributes: (attrs: Partial<GalleryLightboxAttributes>) => void;
}

export interface WPMediaItem {
  id: number;
  url: string;
  mime?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  image?: { src: string };
  sizes?: {
    medium?: { url: string };
    large?: { url: string };
  };
}

const toGalleryMedia = (item: WPMediaItem): GalleryMedia => {
  const isVideo = item.mime?.startsWith("video/") ?? false;
  const poster = isVideo ? (item.image?.src ?? "") : "";
  return {
    id: item.id,
    url: item.url,
    thumbnailUrl: isVideo
      ? poster
      : (item.url ?? item.sizes?.large?.url ?? item.sizes?.medium?.url ?? ""),
    alt: item.alt ?? "",
    caption: item.caption ?? "",
    type: isVideo ? "video" : "image",
    poster,
    width: item.width ?? 0,
    height: item.height ?? 0,
  };
};

export const mergeSelectedMedia = (existing: GalleryMedia[], selected: unknown): GalleryMedia[] => {
  const items = (Array.isArray(selected) ? selected : [selected]) as WPMediaItem[];
  const newIds = new Set(items.map((item) => item.id));
  const kept = existing.filter((media) => !newIds.has(media.id));
  return [...kept, ...items.map(toGalleryMedia)];
};

export const sidebarThumbnailSource = (item: GalleryMedia): string =>
  item.type === "video" ? item.poster || item.thumbnailUrl : item.thumbnailUrl;
