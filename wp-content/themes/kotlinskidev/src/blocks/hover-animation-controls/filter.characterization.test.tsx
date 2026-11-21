import React from "react";
import {
  characterizeBlockEditMarkup,
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
    hoverAnimation: "hover-jump",
    hoverAnimationExtra: ["hover-scale", "hover-rotate"],
    hoverBackgroundColor: "#ff0000",
    hoverTextColor: "#00ff00",
    hoverOpacityEnabled: true,
    hoverOpacityFrom: 90,
    hoverOpacityTo: 20,
    hoverBorderColor: "#0000ff",
    hoverEnhancedGlow: true,
    inViewHover: false,
  },
  gradients: {
    hoverAnimation: "hover-fade",
    hoverBackgroundColor: "linear-gradient(red, blue)",
    hoverTextColor: "linear-gradient(red, blue)",
  },
  gradientGlow: { hoverTextColor: "linear-gradient(red, blue)", hoverEnhancedGlow: true },
  textOnly: { hoverTextColor: "#123456" },
  glowText: { hoverTextColor: "#123456", hoverEnhancedGlow: true },
  opacityDefaults: { hoverOpacityEnabled: true },
  opacityZero: { hoverOpacityEnabled: true, hoverOpacityFrom: 0, hoverOpacityTo: 0 },
  zoomRadius: { hoverAnimation: "hover-zoom-bg", style: { border: { radius: "12px" } } },
  zoomRadiusEmpty: { hoverAnimation: "hover-zoom-bg", style: { border: { radius: "" } } },
  zoomRadiusObject: {
    hoverAnimation: "hover-zoom-bg",
    style: { border: { radius: { topLeft: "1px" } } },
  },
  radiusWithoutZoom: { hoverAnimation: "hover-jump", style: { border: { radius: "12px" } } },
  duplicateExtra: {
    hoverAnimation: "hover-jump",
    hoverAnimationExtra: ["hover-jump", "hover-scale", "hover-scale"],
  },
  existingClassDuplicate: { hoverAnimation: "wp-block-example" },
  emptyStrings: {
    hoverAnimation: "",
    hoverAnimationExtra: [],
    hoverBackgroundColor: "",
    hoverTextColor: "",
    hoverBorderColor: "",
  },
  invalid: { hoverAnimationExtra: "hover-scale", hoverOpacityFrom: "abc", hoverBackgroundColor: 5 },
  borderOnly: { hoverBorderColor: "#abcdef" },
  glowOnly: { hoverEnhancedGlow: true },
};

describe("hover-animation-controls filter characterization", () => {
  it("registration across the block matrix", () => {
    expect(characterizeRegistration()).toMatchSnapshot();
  });
  it("extraProps across the block and attribute matrix", () => {
    expect(characterizeExtraProps(ATTRIBUTE_SETS)).toMatchSnapshot();
  });
  it("BlockEdit panel markup across the attribute matrix", () => {
    expect(
      characterizeBlockEditMarkup(ATTRIBUTE_SETS, [
        "core/group",
        "core/paragraph",
        "kotlinskidev/certificate",
        "core/html",
      ])
    ).toMatchSnapshot();
  });
});
