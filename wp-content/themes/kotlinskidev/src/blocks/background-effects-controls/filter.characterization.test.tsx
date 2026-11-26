import React from "react";
import {
  characterizeExtraProps,
  characterizeRegistration,
} from "@utils/test-support/filter-characterization";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  __experimentalColorGradientControl: () => null,
  store: "core/block-editor",
}));

import "./index";

const ATTRIBUTE_SETS: Record<string, Record<string, unknown>> = {
  empty: {},
  full: {
    backgroundEffect: "kt-bg-fx-aurora",
    backgroundEffectColor1: "#111",
    backgroundEffectColor2: "#222",
    backgroundEffectColor3: "#333",
    backgroundEffectPresetId: 0,
  },
  preset: {
    backgroundEffect: "kt-bg-fx-aurora",
    backgroundEffectColor1: "#111",
    backgroundEffectPresetId: 7,
  },
  effectOnly: { backgroundEffect: "kt-bg-fx-wave" },
  colorsWithoutEffect: { backgroundEffectColor1: "#111", backgroundEffectColor2: "#222" },
  glowBorder: { backgroundEffect: "kt-bg-fx-glow-border", style: { border: { width: "3px" } } },
  glowBorderColors: {
    backgroundEffect: "kt-bg-fx-glow-border",
    backgroundEffectColor2: "#222",
    style: { border: { width: "3px" } },
  },
  glowBorderEmptyWidth: {
    backgroundEffect: "kt-bg-fx-glow-border",
    style: { border: { width: "" } },
  },
  glowBorderObjectWidth: {
    backgroundEffect: "kt-bg-fx-glow-border",
    style: { border: { width: { top: "1px" } } },
  },
  widthWithoutGlow: { backgroundEffect: "kt-bg-fx-wave", style: { border: { width: "3px" } } },
  emptyStrings: {
    backgroundEffect: "",
    backgroundEffectColor1: "",
    backgroundEffectColor2: "",
    backgroundEffectColor3: "",
  },
  invalid: { backgroundEffect: 5, backgroundEffectColor1: [1], backgroundEffectPresetId: "abc" },
};

describe("background-effects-controls filter characterization", () => {
  it("registration across the block matrix", () => {
    expect(characterizeRegistration()).toMatchSnapshot();
  });
  it("extraProps across the block and attribute matrix", () => {
    expect(characterizeExtraProps(ATTRIBUTE_SETS)).toMatchSnapshot();
  });
});
