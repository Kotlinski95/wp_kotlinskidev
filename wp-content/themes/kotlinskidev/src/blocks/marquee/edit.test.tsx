import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInnerBlocksProps: (
    blockProps: Record<string, unknown>,
    options: { allowedBlocks: string[]; template: unknown[] }
  ) => ({
    ...blockProps,
    "data-testid": "inner-blocks",
    "data-allowed": options.allowedBlocks.join(","),
    "data-template-length": options.template.length,
  }),
}));

const mockInsertBlock = jest.fn();
const mockRemoveBlock = jest.fn();
let mockBlocks: Record<string, { innerBlocks: Array<{ clientId: string }> } | undefined> = {};

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    actions: {
      insertBlock: (...args: unknown[]) => {
        mockInsertBlock(...args);
        return { type: "NOOP" };
      },
      removeBlock: (...args: unknown[]) => {
        mockRemoveBlock(...args);
        return { type: "NOOP" };
      },
    },
    selectors: {
      getBlock: (_state: unknown, clientId: string) => mockBlocks[clientId],
    },
  })
);

jest.mock("@wordpress/blocks", () => ({
  createBlock: jest.fn((name: string) => ({ name })),
}));

import Edit from "./edit";

describe("marquee Edit", () => {
  beforeEach(() => {
    mockInsertBlock.mockClear();
    mockRemoveBlock.mockClear();
    mockBlocks = {
      parent: { innerBlocks: [{ clientId: "a" }, { clientId: "b" }, { clientId: "c" }] },
    };
  });

  it("renders InnerBlocks restricted to marquee-item with a 3-item default template", () => {
    render(<Edit attributes={{ speed: 30 }} setAttributes={jest.fn()} clientId="parent" />);

    const innerBlocks = screen.getByTestId("inner-blocks");
    expect(innerBlocks.dataset.allowed).toBe("kotlinskidev/marquee-item");
    expect(innerBlocks.dataset.templateLength).toBe("3");
  });

  it("shows the current item count", () => {
    render(<Edit attributes={{ speed: 30 }} setAttributes={jest.fn()} clientId="parent" />);

    expect(screen.getByText("3 item(s)")).toBeInTheDocument();
  });

  it("inserts a new marquee-item block on Add Technology", async () => {
    const user = userEvent.setup();
    render(<Edit attributes={{ speed: 30 }} setAttributes={jest.fn()} clientId="parent" />);

    await user.click(screen.getByRole("button", { name: "+ Add Technology" }));

    expect(mockInsertBlock).toHaveBeenCalledWith(
      { name: "kotlinskidev/marquee-item" },
      undefined,
      "parent"
    );
  });

  it("removes the last item on Remove Last Technology", async () => {
    const user = userEvent.setup();
    render(<Edit attributes={{ speed: 30 }} setAttributes={jest.fn()} clientId="parent" />);

    await user.click(screen.getByRole("button", { name: "Remove Last Technology" }));

    expect(mockRemoveBlock).toHaveBeenCalledWith("c");
  });

  it("hides Remove Last Technology when only one item remains", () => {
    mockBlocks = { parent: { innerBlocks: [{ clientId: "a" }] } };
    render(<Edit attributes={{ speed: 30 }} setAttributes={jest.fn()} clientId="parent" />);

    expect(
      screen.queryByRole("button", { name: "Remove Last Technology" })
    ).not.toBeInTheDocument();
  });

  it("updates speed via the range control", async () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{ speed: 30 }} setAttributes={setAttributes} clientId="parent" />);

    const input = screen.getByRole("spinbutton", { name: "Scroll duration (seconds)" });
    input.focus();
    await userEvent.keyboard("{ArrowUp}");

    expect(setAttributes).toHaveBeenCalledWith({ speed: 31 });
  });
});
