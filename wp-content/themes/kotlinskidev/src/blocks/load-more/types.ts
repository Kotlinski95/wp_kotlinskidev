export type LoadMoreButtonAlign = "left" | "center" | "right";

export interface LoadMoreAttribute {
  enabled: boolean;
  initialCount: number;
  buttonLabel: string;
  buttonAlign: LoadMoreButtonAlign;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  hoverTextColor: string;
  hoverBackgroundColor: string;
  hoverBorderColor: string;
  underline: boolean;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  textTransform: string;
  paddingY: number | null;
  paddingX: number | null;
}

export const DEFAULT_BORDER_RADIUS = 6;

export const DEFAULT_LOAD_MORE: LoadMoreAttribute = {
  enabled: false,
  initialCount: 6,
  buttonLabel: "",
  buttonAlign: "left",
  textColor: "",
  backgroundColor: "",
  borderColor: "",
  borderWidth: 0,
  borderRadius: DEFAULT_BORDER_RADIUS,
  hoverTextColor: "",
  hoverBackgroundColor: "",
  hoverBorderColor: "",
  underline: false,
  fontSize: "",
  fontWeight: "",
  letterSpacing: "",
  textTransform: "",
  paddingY: null,
  paddingX: null,
};

export const LOAD_MORE_BUTTON_ALIGN_VALUES: LoadMoreButtonAlign[] = ["left", "center", "right"];

export const LOAD_MORE_FONT_SIZE_SLUGS: string[] = [
  "x-small",
  "small",
  "normal",
  "medium",
  "big",
  "large",
  "x-large",
  "xx-large",
];

export const LOAD_MORE_FONT_WEIGHT_VALUES: string[] = ["400", "500", "600", "700", "800"];

export const LOAD_MORE_LETTER_SPACING_VALUES: Record<string, string> = {
  none: "0",
  wide: "0.02em",
  wider: "0.05em",
};

export const LOAD_MORE_TEXT_TRANSFORM_VALUES: string[] = ["none", "uppercase", "capitalize"];

export const LOAD_MORE_PADDING_Y_RANGE = { min: 0.25, max: 2, step: 0.05 };

export const LOAD_MORE_PADDING_X_RANGE = { min: 0.5, max: 4, step: 0.1 };
