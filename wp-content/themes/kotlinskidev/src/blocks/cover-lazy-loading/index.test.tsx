import { applyFilters } from "@wordpress/hooks";

import "./index";

describe("cover-lazy-loading — blocks.registerBlockType filter", () => {
  it("leaves settings unchanged for an unsupported block", () => {
    const settings = { attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings, "core/group")).toBe(settings);
  });

  it.each(["core/cover", "core/image"])(
    "keeps registering the legacy kotlinskidevSkipLazy attribute for %s",
    (blockName) => {
      const settings = { attributes: {} };

      const result = applyFilters("blocks.registerBlockType", settings, blockName) as {
        attributes: { kotlinskidevSkipLazy: { type: string; default: boolean } };
      };

      expect(result.attributes.kotlinskidevSkipLazy).toEqual({ type: "boolean", default: false });
    }
  );

  it("no longer adds an editor control", () => {
    const original = () => null;

    expect(applyFilters("editor.BlockEdit", original)).toBe(original);
  });
});
