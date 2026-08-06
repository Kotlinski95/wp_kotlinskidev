import React from "react";
import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InnerBlocks: ({ template }: { template: [string, object][] }) => (
    <div data-testid="inner-blocks" data-template-length={template.length} />
  ),
}));

import Edit from "./edit";

describe("scroll-section/item Edit", () => {
  it("renders the item wrapper with a heading + paragraph template", () => {
    const { container, getByTestId } = render(<Edit />);

    expect(container.querySelector(".scroll-section__item")).not.toBeNull();
    expect(getByTestId("inner-blocks").dataset.templateLength).toBe("2");
  });
});
