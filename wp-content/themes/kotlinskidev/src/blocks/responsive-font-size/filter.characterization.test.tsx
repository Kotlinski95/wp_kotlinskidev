import React from "react";
import { createReduxStore, register } from "@wordpress/data";
import {
  characterizeBlockEditMarkup,
  characterizeRegistration,
} from "@utils/test-support/filter-characterization";

jest.mock("@wordpress/blocks", () => ({
  hasBlockSupport: (name: string) => name !== "core/image",
}));

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  store: "core/block-editor",
}));

const THEME_FONT_SIZES = [
  { name: "Small", slug: "small", size: "0.875rem" },
  { name: "Large", slug: "large", size: "2rem" },
];

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    selectors: {
      getSettings: () => ({ fontSizes: THEME_FONT_SIZES }),
    },
  })
);

import "./index";

const ATTRIBUTE_SETS: Record<string, Record<string, unknown>> = {
  empty: {},
  presets: { responsiveFontSize: { mobile: "0.875rem", desktop: "2rem" } },
  custom: {
    responsiveFontSize: {
      tablet: "1.5rem",
      tabletCustom: true,
      tabletCustomValue: "1.5rem",
      tabletPreset: "0.875rem",
    },
  },
  emptyObject: { responsiveFontSize: {} },
};

describe("responsive-font-size filter characterization", () => {
  it("registration across the block matrix", () => {
    expect(characterizeRegistration()).toMatchSnapshot();
  });

  it("BlockEdit markup across the attribute matrix", () => {
    expect(
      characterizeBlockEditMarkup(ATTRIBUTE_SETS, [
        "core/paragraph",
        "core/image",
        "kotlinskidev/certificate",
      ])
    ).toMatchSnapshot();
  });
});
