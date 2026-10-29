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

describe("kotlinskidev/model-viewer", () => {
  it("registers the block with the Edit component and a null-rendering Save", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/model-viewer" }),
      expect.objectContaining({ edit: Edit, save: expect.any(Function) })
    );

    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];
    expect(save()).toBeNull();
  });
});
