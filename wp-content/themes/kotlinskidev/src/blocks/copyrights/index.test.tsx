import React from "react";
import { render, screen } from "@testing-library/react";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
}));

jest.mock(
  "@wordpress/server-side-render",
  () => ({
    __esModule: true,
    default: ({ block }: { block: string }) => <div data-testid="ssr">{block}</div>,
  }),
  { virtual: true }
);

import "./index";

describe("kotlinskidev/copyrights", () => {
  it("registers the block under the kotlinskidev/copyrights name", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/copyrights",
      expect.objectContaining({ title: "Copyrights", category: "kotlinskidev" })
    );
  });

  it("renders a server-side render for the block in the editor", () => {
    const { edit: Edit } = (registerBlockType as jest.Mock).mock.calls[0][1];

    render(<Edit />);

    expect(screen.getByTestId("ssr")).toHaveTextContent("kotlinskidev/copyrights");
  });

  it("saves nothing, since the block is fully server-rendered", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(save()).toBeNull();
  });
});
