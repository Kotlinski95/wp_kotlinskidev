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

describe("kotlinskidev/process-steps", () => {
  it("registers the process-step block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/process-step" }),
      expect.objectContaining({ edit: ItemEdit, save: ItemSave })
    );
  });

  it("registers the process-steps block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/process-steps" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });
});
