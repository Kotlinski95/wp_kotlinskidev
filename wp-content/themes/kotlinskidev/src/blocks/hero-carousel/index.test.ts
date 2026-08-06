import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("./edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./save", () => ({ __esModule: true, default: () => null }));
jest.mock("./slide/edit", () => ({ __esModule: true, default: () => null }));
jest.mock("./slide/save", () => ({ __esModule: true, default: () => null }));

import Edit from "./edit";
import Save from "./save";
import SlideEdit from "./slide/edit";
import SlideSave from "./slide/save";
import "./index";

describe("kotlinskidev/hero-carousel", () => {
  it("registers the hero-carousel-slide block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/hero-carousel-slide" }),
      expect.objectContaining({ edit: SlideEdit, save: SlideSave })
    );
  });

  it("registers the hero-carousel block", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/hero-carousel" }),
      expect.objectContaining({ edit: Edit, save: Save })
    );
  });
});
