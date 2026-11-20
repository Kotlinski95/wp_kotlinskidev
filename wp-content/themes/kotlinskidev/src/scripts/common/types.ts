export type EventCallback = (event: Event) => void;
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rect extends Point, Dimensions {}

export type DeviceType = "mobile" | "tablet" | "desktop";
export type ThemeMode = "light" | "dark" | "auto";
