import { registerBlockStyle } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockStyle: jest.fn(),
}));

import "./index";

describe("button-styles", () => {
  it("registers the gradient-outline style on core/button", () => {
    expect(registerBlockStyle).toHaveBeenCalledWith("core/button", {
      name: "gradient-outline",
      label: "Gradient Outline",
    });
  });
});
