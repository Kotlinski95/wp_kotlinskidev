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

describe("kotlinskidev/pricing-cards", () => {
  it("registers the pricing-card block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/pricing-card" }),
      expect.objectContaining({ edit: ItemEdit, save: ItemSave })
    );
  });

  it("registers the pricing-cards block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/pricing-cards" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });
});
