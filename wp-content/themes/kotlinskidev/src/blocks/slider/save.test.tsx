import React from "react";
import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  InnerBlocks: { Content: () => <div data-testid="inner-blocks-content" /> },
}));

import save from "./save";

describe("slider save", () => {
  it("renders InnerBlocks.Content", () => {
    const { getByTestId } = render(save());

    expect(getByTestId("inner-blocks-content")).toBeInTheDocument();
  });
});
