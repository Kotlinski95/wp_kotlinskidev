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

describe("wpe/slider", () => {
  it("registers the block with the Edit and save components", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "wpe/slider" }),
      expect.objectContaining({ edit: Edit, save })
    );
  });
});
