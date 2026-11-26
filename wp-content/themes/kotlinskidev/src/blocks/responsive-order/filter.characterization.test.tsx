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
  defaults: { responsiveOrder: { desktop: 0, tablet: 0, mobile: 0 } },
  full: { responsiveOrder: { desktop: 3, tablet: -1, mobile: 20 } },
  mixed: { responsiveOrder: { desktop: 0, tablet: 2, mobile: 0 } },
  emptyObject: { responsiveOrder: {} },
  stringValues: { responsiveOrder: { desktop: "2", tablet: "", mobile: "0" } },
  nullValues: { responsiveOrder: { desktop: null, tablet: null, mobile: null } },
  invalid: { responsiveOrder: "first" },
  decimals: { responsiveOrder: { desktop: 1.5, tablet: NaN, mobile: -0 } },
};

describe("responsive-order filter characterization", () => {
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
