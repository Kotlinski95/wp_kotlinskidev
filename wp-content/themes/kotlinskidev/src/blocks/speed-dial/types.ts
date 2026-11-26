export type Corner = "bottom-right" | "bottom-left" | "top-right" | "top-left";
export type Device = "desktop" | "tablet" | "mobile";
export type SpeedDialAction = "phone" | "email" | "accessibility" | "url" | "trigger" | "custom";

export type PositionByDevice = Record<Device, Corner>;
export type OffsetByDevice = Record<Device, { x: number; y: number }>;

export interface SpeedDialAttributes {
  label: string;
  position: PositionByDevice;
  offset: OffsetByDevice;
  direction: "auto" | "up" | "down" | "left" | "right";
  labels: "auto" | "tooltip" | "always" | "hidden";
  motion: "scale" | "fade" | "none";
  zIndex: number;
  closeOnAction: boolean;
  avoidMobileNav: boolean;
  toggleIcon: string;
  toggleIconId: number;
  toggleIconUrl: string;
  toggleBackgroundColor: string;
  toggleTextColor: string;
  itemBackgroundColor: string;
  itemTextColor: string;
}

export interface SpeedDialItemAttributes {
  action: SpeedDialAction;
  useSiteContact: boolean;
  value: string;
  triggerAction: string;
  label: string;
  ariaLabel: string;
  opensInNewTab: boolean;
  icon: string;
  iconId: number;
  iconUrl: string;
  backgroundColor: string;
  textColor: string;
}

declare global {
  interface Window {
    kotlinskidevSpeedDial?: { customAllowedBlocks?: string[] };
  }
}

export const SPEED_DIAL_BLOCK = "kotlinskidev/speed-dial";
export const SPEED_DIAL_ITEM_BLOCK = "kotlinskidev/speed-dial-item";
export const MAX_Z_INDEX = 2147482999;
