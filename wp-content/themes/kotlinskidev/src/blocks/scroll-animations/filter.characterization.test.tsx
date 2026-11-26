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
    scrollAnimation: "fade-up-on-scroll",
    scrollAnimationDelay: "delay-300",
    scrollAnimationTranslate: "translate-lg",
  },
  animationOnly: { scrollAnimation: "fade-in-on-scroll" },
  delayOnly: { scrollAnimationDelay: "delay-100" },
  translateOnly: { scrollAnimationTranslate: "translate-sm" },
  emptyStrings: { scrollAnimation: "", scrollAnimationDelay: "", scrollAnimationTranslate: "" },
  invalid: { scrollAnimation: 5, scrollAnimationDelay: ["x"], scrollAnimationTranslate: {} },
};

describe("scroll-animations filter characterization", () => {
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
