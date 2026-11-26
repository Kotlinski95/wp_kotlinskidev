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
  flowLayout: { layout: { type: "default" }, kotlinskidevGridColumns: { desktop: 3 } },
  gridNoColumns: { layout: { type: "grid" } },
  gridEmptyColumns: { layout: { type: "grid" }, kotlinskidevGridColumns: {} },
  gridFull: {
    layout: { type: "grid" },
    kotlinskidevGridColumns: { desktop: 4, tablet: 2, mobile: 1 },
  },
  gridPartial: { layout: { type: "grid" }, kotlinskidevGridColumns: { tablet: 2 } },
  gridDecimal: { layout: { type: "grid" }, kotlinskidevGridColumns: { desktop: 2.5, mobile: "3" } },
};

describe("responsive-grid-columns filter characterization", () => {
  it("registration across the block matrix", () => {
    expect(characterizeRegistration()).toMatchSnapshot();
  });

  it("BlockListBlock wrapper across the attribute matrix", () => {
    expect(characterizeBlockListBlock(ATTRIBUTE_SETS)).toMatchSnapshot();
  });

  it("BlockEdit panel markup across the attribute matrix", () => {
    expect(
      characterizeBlockEditMarkup(ATTRIBUTE_SETS, ["core/group", "core/paragraph"])
    ).toMatchSnapshot();
  });
});
