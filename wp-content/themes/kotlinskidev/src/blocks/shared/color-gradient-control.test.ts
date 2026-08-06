function mockControl() {
  return null;
}

jest.mock("@wordpress/block-editor", () => ({
  __experimentalColorGradientControl: mockControl,
}));

import { ColorGradientControl } from "./color-gradient-control";

describe("ColorGradientControl", () => {
  it("re-exports the experimental color gradient control from @wordpress/block-editor", () => {
    expect(ColorGradientControl).toBe(mockControl);
  });
});
