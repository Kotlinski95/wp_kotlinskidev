import React from "react";
import {
  characterizeBlockEditMarkup,
  characterizeBlockListBlock,
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
  emptyObject: { responsiveDisplay: {} },
  defaults: { responsiveDisplay: { desktop: {}, tablet: {}, mobile: {} } },
  full: {
    responsiveDisplay: {
      desktop: {
        display: "flex",
        flexDirection: "flex-row",
        justifyContent: "justify-content-center",
        alignItems: "align-items-end",
        justifySelf: "justify-self-start",
        alignSelf: "align-self-stretch",
      },
      tablet: {
        display: "grid",
        flexDirection: "flex-column",
        justifyContent: "justify-content-space-between",
        alignItems: "align-items-start",
        justifySelf: "justify-self-end",
        alignSelf: "align-self-center",
      },
      mobile: {
        display: "none",
        flexDirection: "flex-row",
        justifyContent: "justify-content-space-evenly",
        alignItems: "align-items-center",
        justifySelf: "justify-self-baseline",
        alignSelf: "align-self-end",
      },
    },
  },
  mixed: {
    responsiveDisplay: {
      desktop: { display: "block" },
      tablet: {},
      mobile: { alignSelf: "align-self-start", display: "inline-flex" },
    },
  },
  emptyStrings: {
    responsiveDisplay: {
      desktop: { display: "", flexDirection: "" },
      tablet: { display: "" },
      mobile: { alignSelf: "" },
    },
  },
  missingDevices: { responsiveDisplay: { tablet: { display: "table" } } },
  nullDevices: { responsiveDisplay: { desktop: null, tablet: null, mobile: null } },
  invalid: {
    responsiveDisplay: {
      desktop: { display: 5, flexDirection: "weird value" },
      tablet: "flex",
      mobile: [1, 2],
    },
  },
  invalidRoot: { responsiveDisplay: "flex" },
};

describe("responsive-display filter characterization", () => {
  it("registration across the block matrix", () => {
    expect(characterizeRegistration()).toMatchSnapshot();
  });
  it("extraProps across the block and attribute matrix", () => {
    expect(characterizeExtraProps(ATTRIBUTE_SETS)).toMatchSnapshot();
  });
  it("BlockListBlock wrapper across the attribute matrix", () => {
    expect(characterizeBlockListBlock(ATTRIBUTE_SETS)).toMatchSnapshot();
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
