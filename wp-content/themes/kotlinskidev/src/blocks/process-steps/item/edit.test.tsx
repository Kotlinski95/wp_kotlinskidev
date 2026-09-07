import React from "react";
import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InnerBlocks: ({ template }: { template: [string, object][] }) => (
    <div data-testid="inner-blocks" data-template-length={template.length} />
  ),
}));

import Edit from "./edit";

describe("process-steps/item Edit", () => {
  it("renders the marker and body wrapper with a heading + 2 paragraph template", () => {
    const { container, getByTestId } = render(<Edit />);

    expect(container.querySelector(".process-step")).not.toBeNull();
    expect(container.querySelector(".process-step__marker .process-step__number")).not.toBeNull();
    expect(container.querySelector(".process-step__body")).not.toBeNull();
    expect(getByTestId("inner-blocks").dataset.templateLength).toBe("3");
  });
});
