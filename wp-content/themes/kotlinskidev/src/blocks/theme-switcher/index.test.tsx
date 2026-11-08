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

describe("kotlinskidev/theme-switcher", () => {
  it("registers the block under the kotlinskidev/theme-switcher name", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/theme-switcher",
      expect.objectContaining({ title: "Theme Switcher", category: "kotlinskidev" })
    );
  });

  it("renders a server-side render for the block in the editor", () => {
    const { edit: Edit } = (registerBlockType as jest.Mock).mock.calls[0][1];

    render(<Edit />);

    expect(screen.getByTestId("ssr")).toHaveTextContent("kotlinskidev/theme-switcher");
  });

  it("saves nothing, since the block is fully server-rendered", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(save()).toBeNull();
  });
});
