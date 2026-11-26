import React from "react";
import {
  characterizeBlockEditMarkup,
  characterizeBlockListBlock,
  characterizeRegistration,
} from "@utils/test-support/filter-characterization";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

const ATTRIBUTE_SETS: Record<string, Record<string, unknown>> = {
  empty: {},
  defaults: { responsiveHeight: { desktop: {}, tablet: {}, mobile: {} } },
  full: {
    responsiveHeight: {
      desktop: { minHeight: "50vh" },
      tablet: { minHeight: "none" },
      mobile: { minHeight: "20rem" },
    },
  },
  mixed: { responsiveHeight: { desktop: { minHeight: "10px" }, tablet: {} } },
  emptyStrings: {
    responsiveHeight: {
      desktop: { minHeight: "" },
      tablet: { minHeight: "" },
      mobile: { minHeight: "" },
    },
  },
  missingDevices: { responsiveHeight: {} },
  nullDevices: { responsiveHeight: { desktop: null, tablet: null, mobile: null } },
  invalidRoot: { responsiveHeight: "50vh" },
};

const EDIT_BLOCKS = ["core/group", "core/paragraph", "kotlinskidev/certificate"];

describe("responsive-height filter characterization", () => {
  it("registration across the block matrix", () => {
    expect(characterizeRegistration()).toMatchSnapshot();
  });

  it("BlockListBlock wrapper across the attribute matrix", () => {
    expect(characterizeBlockListBlock(ATTRIBUTE_SETS)).toMatchSnapshot();
  });

  it("BlockEdit panel markup across the attribute matrix", () => {
    expect(characterizeBlockEditMarkup(ATTRIBUTE_SETS, EDIT_BLOCKS)).toMatchSnapshot();
  });
});
