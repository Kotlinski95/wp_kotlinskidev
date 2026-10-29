jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
  getBlockType: jest.fn(),
}));

jest.mock("@wordpress/dom-ready", () => ({
  __esModule: true,
  default: (cb: () => void) => cb(),
}));

jest.mock("./edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./save", () => ({ __esModule: true, default: () => null }));
jest.mock("../holder/edit", () => ({ __esModule: true, default: () => null }));
jest.mock("../holder/save", () => ({ __esModule: true, default: () => null }));

interface Mocks {
  registerBlockType: jest.Mock;
  getBlockType: jest.Mock;
  Edit: unknown;
  Save: unknown;
  HolderEdit: unknown;
  HolderSave: unknown;
}

function loadModule(): Mocks {
  jest.resetModules();
  const blocks = jest.requireMock("@wordpress/blocks") as {
    registerBlockType: jest.Mock;
    getBlockType: jest.Mock;
  };
  require("./index");
  return {
    registerBlockType: blocks.registerBlockType,
    getBlockType: blocks.getBlockType,
    Edit: (jest.requireMock("./edit") as { default: unknown }).default,
    Save: (jest.requireMock("./save") as { default: unknown }).default,
    HolderEdit: (jest.requireMock("../holder/edit") as { default: unknown }).default,
    HolderSave: (jest.requireMock("../holder/save") as { default: unknown }).default,
  };
}

describe("kotlinskidev/simple-grid", () => {
  it("registers the holder block", () => {
    const { registerBlockType, getBlockType, HolderEdit, HolderSave } = loadModule();
    getBlockType.mockReturnValue(undefined);

    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/holder" }),
      expect.objectContaining({ edit: HolderEdit, save: HolderSave })
    );
  });

  it("registers the simple-grid block", () => {
    const { registerBlockType, Edit, Save } = loadModule();

    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/simple-grid" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });

  it("adds kotlinskidev/holder as a parent for a navigation block with no parent yet", () => {
    const navLink: { parent?: string[] } = {};
    const navSubmenu: { parent?: string[] } = {};
    jest.resetModules();
    const blocks = jest.requireMock("@wordpress/blocks") as { getBlockType: jest.Mock };
    blocks.getBlockType.mockImplementation((name: string) =>
      name === "core/navigation-link" ? navLink : navSubmenu
    );
    require("./index");

    expect(navLink.parent).toEqual(["kotlinskidev/holder"]);
    expect(navSubmenu.parent).toEqual(["kotlinskidev/holder"]);
  });

  it("appends kotlinskidev/holder to an existing parent list", () => {
    const navLink = { parent: ["core/navigation"] };
    jest.resetModules();
    const blocks = jest.requireMock("@wordpress/blocks") as { getBlockType: jest.Mock };
    blocks.getBlockType.mockImplementation((name: string) =>
      name === "core/navigation-link" ? navLink : undefined
    );
    require("./index");

    expect(navLink.parent).toEqual(["core/navigation", "kotlinskidev/holder"]);
  });

  it("does not duplicate kotlinskidev/holder if it is already a parent", () => {
    const navLink = { parent: ["kotlinskidev/holder"] };
    jest.resetModules();
    const blocks = jest.requireMock("@wordpress/blocks") as { getBlockType: jest.Mock };
    blocks.getBlockType.mockImplementation((name: string) =>
      name === "core/navigation-link" ? navLink : undefined
    );
    require("./index");

    expect(navLink.parent).toEqual(["kotlinskidev/holder"]);
  });

  it("does nothing when a target block type is not registered", () => {
    jest.resetModules();
    const blocks = jest.requireMock("@wordpress/blocks") as { getBlockType: jest.Mock };
    blocks.getBlockType.mockReturnValue(undefined);

    expect(() => require("./index")).not.toThrow();
  });
});
