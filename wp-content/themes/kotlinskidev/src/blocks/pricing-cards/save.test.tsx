import React from "react";
import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  InnerBlocks: { Content: () => <div data-testid="inner-blocks-content" /> },
}));

import Save from "./save";

describe("pricing-cards Save", () => {
  it("renders InnerBlocks.Content", () => {
    const { getByTestId } = render(<Save />);

    expect(getByTestId("inner-blocks-content")).toBeInTheDocument();
  });
});
