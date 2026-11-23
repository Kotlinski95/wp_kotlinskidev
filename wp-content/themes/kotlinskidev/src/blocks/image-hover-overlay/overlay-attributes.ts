export const DEFAULT_BACKGROUND_OPACITY = 100;
const PERCENT = 100;

export interface OverlayAttributes {
  kotlinskidevOverlayEnabled?: boolean;
  kotlinskidevOverlayHeading?: string;
  kotlinskidevOverlayDescription?: string;
  kotlinskidevOverlayBackgroundColor?: string;
  kotlinskidevOverlayBackgroundOpacity?: number;
  kotlinskidevOverlayTextColor?: string;
}

export interface OverlayValues {
  enabled: boolean;
  heading: string;
  description: string;
  backgroundColor: string;
  backgroundOpacity: number;
  textColor: string;
}

export const readOverlayValues = (attributes: OverlayAttributes): OverlayValues => ({
  enabled: Boolean(attributes.kotlinskidevOverlayEnabled),
  heading: attributes.kotlinskidevOverlayHeading ?? "",
  description: attributes.kotlinskidevOverlayDescription ?? "",
  backgroundColor: attributes.kotlinskidevOverlayBackgroundColor ?? "",
  backgroundOpacity: attributes.kotlinskidevOverlayBackgroundOpacity ?? DEFAULT_BACKGROUND_OPACITY,
  textColor: attributes.kotlinskidevOverlayTextColor ?? "",
});

export const opacityToFraction = (opacity: number): number => opacity / PERCENT;
