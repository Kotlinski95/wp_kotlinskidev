import React from "react";
import {
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
    navRevealAnimation: "reveal-fade-up",
    navRevealDelay: 150,
    navRevealTranslate: "translate-lg",
  },
  animationOnly: { navRevealAnimation: "reveal-fade" },
  delayWithoutAnimation: { navRevealDelay: 100 },
  translateWithoutAnimation: { navRevealTranslate: "translate-sm" },
  zeroDelay: { navRevealAnimation: "reveal-fade", navRevealDelay: 0 },
  emptyStrings: { navRevealAnimation: "", navRevealTranslate: "" },
  invalid: { navRevealAnimation: 5, navRevealDelay: "abc", navRevealTranslate: [1] },
};

describe("nav-reveal-animation filter characterization", () => {
  it("registration across the block matrix", () => {
    expect(characterizeRegistration()).toMatchSnapshot();
  });
  it("extraProps across the block and attribute matrix", () => {
    expect(characterizeExtraProps(ATTRIBUTE_SETS)).toMatchSnapshot();
  });
});
