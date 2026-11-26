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
  disabled: { enableCounter: false, counterDuration: "3000" },
  defaults: {
    enableCounter: true,
    counterDuration: "2000",
    counterCustomDuration: 2000,
    counterEasing: "easeOut",
  },
  full: {
    enableCounter: true,
    counterDuration: "4000",
    counterCustomDuration: 1500,
    counterEasing: "bounce",
  },
  custom: {
    enableCounter: true,
    counterDuration: "custom",
    counterCustomDuration: 750,
    counterEasing: "linear",
  },
  customZero: { enableCounter: true, counterDuration: "custom", counterCustomDuration: 0 },
  customMissing: { enableCounter: true, counterDuration: "custom" },
  enabledOnly: { enableCounter: true },
  emptyStrings: { enableCounter: true, counterDuration: "", counterEasing: "" },
  invalid: {
    enableCounter: "yes",
    counterDuration: 5,
    counterCustomDuration: "abc",
    counterEasing: null,
  },
};

describe("animated-counter filter characterization", () => {
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
