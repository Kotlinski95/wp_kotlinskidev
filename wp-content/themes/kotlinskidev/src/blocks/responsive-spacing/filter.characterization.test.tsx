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
  defaults: {
    desktopPadding: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    mobileMargin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
  },
  full: {
    desktopPadding: { top: "1px", right: "2px", bottom: "3px", left: "4px" },
    desktopMargin: { top: "1rem", right: "2rem", bottom: "3rem", left: "4rem" },
    tabletPadding: { top: "5%", right: "6%", bottom: "7%", left: "8%" },
    tabletMargin: { top: "1vw", right: "2vw", bottom: "3vh", left: "4vh" },
    mobilePadding: { top: "9px", right: "9px", bottom: "9px", left: "9px" },
    mobileMargin: { top: "-1px", right: "-2px", bottom: "-3px", left: "-4px" },
  },
  desktopOnly: { desktopPadding: { top: "10px", right: "0px", bottom: "0px", left: "20px" } },
  mobileOnly: { mobileMargin: { top: "10px", right: "0px", bottom: "0px", left: "0px" } },
  partialSides: { desktopMargin: { top: "1px" } },
  emptyStrings: { desktopPadding: { top: "", right: "", bottom: "", left: "" } },
  nullValues: { desktopPadding: null, desktopMargin: null },
  invalidRoot: { desktopPadding: "1px" },
};

const EDIT_BLOCKS = ["core/group", "core/paragraph", "kotlinskidev/certificate"];

describe("responsive-spacing filter characterization", () => {
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
