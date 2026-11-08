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
};

export const LOAD_MORE_BUTTON_ALIGN_VALUES: LoadMoreButtonAlign[] = ["left", "center", "right"];
