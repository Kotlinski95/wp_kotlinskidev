export type OverlayMenu = "never" | "mobile" | "always";
export type DisplayMode = "mega" | "list" | "bar";
export type Visibility = "all" | "desktop" | "mobile";
export type HorizontalSide = "right" | "left";

export interface NavigationPost {
  id: number;
  slug: string;
  title: { rendered: string };
}

export interface NavigationAttributes {
  menuSlug: string;
  overlayMenu: OverlayMenu;
  displayMode: DisplayMode;
  visibility: Visibility;
  overlaySlide: HorizontalSide;
  hamburgerLineAlign: HorizontalSide;
  className: string;
  linkNavigatesOnClick: boolean;
  showHamburgerBorder: boolean;
  hideAccordionDividers: boolean;
  blurInactiveLinks: boolean;
  blurAmount: string;
  blurIncludeUtility: boolean;
  barSolidBackground: string;
}

export interface NavigationPanelProps {
  attributes: NavigationAttributes;
  setAttributes: (attrs: Partial<NavigationAttributes>) => void;
}
