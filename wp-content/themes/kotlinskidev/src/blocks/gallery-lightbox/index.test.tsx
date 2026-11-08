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
import Save from "./save";
import "./index";

describe("kotlinskidev/gallery-lightbox", () => {
  it("registers the block with the Edit and Save components", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/gallery-lightbox" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });
});
