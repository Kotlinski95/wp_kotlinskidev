import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("./edit", () => ({
  __esModule: true,
  default: () => null,
}));

import Edit from "./edit";
import "./index";

describe("googlemaps/google-maps-block", () => {
  it("registers the block with its metadata name and the Edit component", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "googlemaps/google-maps-block" }),
      expect.objectContaining({ edit: Edit })
    );
  });
});
