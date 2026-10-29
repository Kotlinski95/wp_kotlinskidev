import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("./edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./save", () => ({ __esModule: true, default: () => null }));
jest.mock("./item/edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./item/save", () => ({ __esModule: true, default: () => null }));
jest.mock("./nav-link/edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./nav-link/save", () => ({ __esModule: true, default: () => null }));

import Edit from "./edit";
import Save from "./save";
import ItemEdit from "./item/edit";
import ItemSave from "./item/save";
import NavLinkEdit from "./nav-link/edit";
import NavLinkSave from "./nav-link/save";
import "./index";

describe("kotlinskidev/content-tabs", () => {
  it("registers the content-tabs-nav-link block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/content-tabs-nav-link" }),
      expect.objectContaining({ edit: NavLinkEdit, save: NavLinkSave })
    );
  });

  it("registers the content-tabs-item block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/content-tabs-item" }),
      expect.objectContaining({ edit: ItemEdit, save: ItemSave })
    );
  });

  it("registers the content-tabs block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/content-tabs" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });
});
