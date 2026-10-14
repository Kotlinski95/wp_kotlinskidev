import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  InnerBlocks: { Content: () => "inner-blocks-content" },
}));

jest.mock("./edit", () => ({
  __esModule: true,
  default: () => null,
}));

import Edit from "./edit";
import "./index";

describe("kotlinskidev/button", () => {
  it("registers the block with the Edit component and a Save function", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/button" }),
      expect.objectContaining({ edit: Edit, save: expect.any(Function) })
    );
  });

  it("Save renders null when useInnerBlocks is off", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];
    expect(save({ attributes: { useInnerBlocks: false } })).toBeNull();
  });

  it("Save renders InnerBlocks.Content when useInnerBlocks is on", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];
    expect(save({ attributes: { useInnerBlocks: true } })).not.toBeNull();
  });
});
