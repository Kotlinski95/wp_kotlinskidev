import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InnerBlocks: ({ template }: { template: unknown[] }) => (
    <div data-testid="inner-blocks" data-template-length={template.length} />
  ),
}));

import Edit from "./edit";

describe("content-tabs-item Edit", () => {
  it("allows unrestricted inner blocks with a nav-link + paragraph starter template", () => {
    render(<Edit clientId="item-1" />);

    const innerBlocks = screen.getByTestId("inner-blocks");
    expect(innerBlocks).not.toHaveAttribute("data-allowed");
    expect(innerBlocks).toHaveAttribute("data-template-length", "2");
  });

  it("renders in place (no portal, no hiding) when there is no surrounding ContentTabsPortalContext", () => {
    render(<Edit clientId="item-1" />);

    expect(screen.getByTestId("inner-blocks")).toBeInTheDocument();
  });
});
