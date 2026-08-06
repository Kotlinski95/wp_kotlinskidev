import React from "react";
import { render, screen } from "@testing-library/react";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
}));

import "./index";

describe("kotlinskidev/scroll-to-top", () => {
  it("registers the block under the kotlinskidev/scroll-to-top name", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/scroll-to-top",
      expect.objectContaining({ title: "Scroll To Top", category: "kotlinskidev" })
    );
  });

  it("renders an editor placeholder describing the fixed frontend button", () => {
    const { edit: Edit } = (registerBlockType as jest.Mock).mock.calls[0][1];

    render(<Edit />);

    expect(screen.getByText("Scroll To Top")).toBeInTheDocument();
    expect(
      screen.getByText("Fixed button, visible on the frontend while scrolling")
    ).toBeInTheDocument();
  });

  it("saves nothing, since the block is rendered on the frontend via PHP", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(save()).toBeNull();
  });
});
