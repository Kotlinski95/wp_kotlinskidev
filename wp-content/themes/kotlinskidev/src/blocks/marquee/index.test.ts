import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("./edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./save", () => ({ __esModule: true, default: () => null }));
jest.mock("./item/edit", () => ({ __esModule: true, default: () => null }));

import Edit from "./edit";
import Save from "./save";
import ItemEdit from "./item/edit";
import "./index";

describe("kotlinskidev/marquee", () => {
  it("registers the marquee-item block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/marquee-item" }),
      expect.objectContaining({ edit: ItemEdit })
    );
  });

  it("registers the marquee block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/marquee" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });
});
