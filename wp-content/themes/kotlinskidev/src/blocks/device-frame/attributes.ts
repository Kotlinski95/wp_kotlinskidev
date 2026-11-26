import type { DeviceType, PositionStyle, LoadingStrategy, FetchPriority } from "./devices";

export interface DeviceFrameAttributes {
  device: DeviceType;
  aspectRatio: string;
  imageId: number;
  imageUrl: string;
  alt: string;
  positionStyle: PositionStyle;
  keepEffectOnMobile: boolean;
  objectPosition: string;
  loading: LoadingStrategy;
  fetchPriority: FetchPriority;
  enableLightbox: boolean;
}

export interface DeviceFramePanelProps {
  attributes: DeviceFrameAttributes;
  setAttributes: (attrs: Partial<DeviceFrameAttributes>) => void;
}
