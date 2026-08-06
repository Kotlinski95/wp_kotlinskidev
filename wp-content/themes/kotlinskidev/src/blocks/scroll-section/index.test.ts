import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("./edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./save", () => ({ __esModule: true, default: () => null }));
jest.mock("./item/edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./item/save", () => ({ __esModule: true, default: () => null }));

import Edit from "./edit";
import Save from "./save";
import ItemEdit from "./item/edit";
import ItemSave from "./item/save";
import "./index";

describe("kotlinskidev/scroll-section", () => {
  it("registers the scroll-section-item block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/scroll-section-item" }),
      expect.objectContaining({ edit: ItemEdit, save: ItemSave })
    );
  });

  it("registers the scroll-section block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/scroll-section" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });
});
