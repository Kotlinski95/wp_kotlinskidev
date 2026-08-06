import React from "react";
import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InnerBlocks: ({ templateLock }: { templateLock: boolean }) => (
    <div data-testid="inner-blocks" data-template-lock={String(templateLock)} />
  ),
}));

import Edit from "./edit";

describe("holder Edit", () => {
  it("renders a wrapper with the kt-holder class and unlocked InnerBlocks", () => {
    const { container, getByTestId } = render(<Edit />);

    expect(container.querySelector(".kt-holder")).not.toBeNull();
    expect(getByTestId("inner-blocks").dataset.templateLock).toBe("false");
  });
});
