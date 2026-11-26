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
  defaults: { responsiveWidth: { desktop: {}, tablet: {}, mobile: {} } },
  full: {
    responsiveWidth: {
      desktop: { width: "50%", maxWidth: "80rem" },
      tablet: { width: "auto", maxWidth: "fit-content" },
      mobile: { width: "100vw", maxWidth: "stretch" },
    },
  },
  keywords: {
    responsiveWidth: {
      desktop: { width: "max-content" },
      tablet: { maxWidth: "min-content" },
      mobile: {},
    },
  },
  mixed: { responsiveWidth: { desktop: { width: "10px" }, tablet: {} } },
  emptyStrings: {
    responsiveWidth: {
      desktop: { width: "", maxWidth: "" },
      tablet: { width: "" },
      mobile: { maxWidth: "" },
    },
  },
  missingDevices: { responsiveWidth: {} },
  nullDevices: { responsiveWidth: { desktop: null, tablet: null, mobile: null } },
  invalidRoot: { responsiveWidth: "50%" },
};

const EDIT_BLOCKS = ["core/group", "core/paragraph", "kotlinskidev/certificate"];

describe("responsive-width filter characterization", () => {
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
