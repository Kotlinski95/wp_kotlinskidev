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

describe("kotlinskidev/speed-dial", () => {
  it("registers the speed-dial-item block restricted to the speed-dial parent", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "kotlinskidev/speed-dial-item",
        parent: ["kotlinskidev/speed-dial"],
      }),
      expect.objectContaining({ edit: ItemEdit, save: ItemSave })
    );
  });

  it("registers the speed-dial block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/speed-dial" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });

  it("registers the item before the parent", () => {
    const names = (registerBlockType as jest.Mock).mock.calls.map(([metadata]) => metadata.name);

    expect(names).toEqual(["kotlinskidev/speed-dial-item", "kotlinskidev/speed-dial"]);
  });
});
