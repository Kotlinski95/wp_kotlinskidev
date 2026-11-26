import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("./edit", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("./save", () => ({
  __esModule: true,
  default: () => null,
}));

import Edit from "./edit";
import save from "./save";
import "./index";
import metadata from "./block.json";

describe("wpe/slider", () => {
  it("registers the block with the Edit and save components", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "wpe/slider" }),
      expect.objectContaining({ edit: Edit, save })
    );
  });

  it("declares paginationStyle as a dots/pill enum defaulting to dots", () => {
    expect(metadata.attributes.paginationStyle).toEqual({
      type: "string",
      enum: ["dots", "pill"],
      default: "dots",
    });
  });

  it("declares equalSlideHeight as a boolean defaulting to false", () => {
    expect(metadata.attributes.equalSlideHeight).toEqual({ type: "boolean", default: false });
  });

  it("declares the active slide highlight attributes with defaults", () => {
    expect(metadata.attributes.highlightActiveSlide).toEqual({ type: "boolean", default: false });
    expect(metadata.attributes.activeHighlightColor).toEqual({ type: "string", default: "" });
    expect(metadata.attributes.activeHighlightStrength).toEqual({ type: "number", default: 45 });
  });
});
