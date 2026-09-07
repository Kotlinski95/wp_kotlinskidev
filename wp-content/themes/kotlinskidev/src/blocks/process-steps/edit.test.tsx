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

describe("process-steps Edit", () => {
  beforeEach(() => {
    mockInsertBlock.mockClear();
    mockRemoveBlock.mockClear();
    mockBlocks = {
      parent: { innerBlocks: [{ clientId: "a" }, { clientId: "b" }, { clientId: "c" }] },
    };
  });

  it("renders InnerBlocks restricted to process-step with a 3-item default template", () => {
    render(<Edit clientId="parent" />);

    const innerBlocks = screen.getByTestId("inner-blocks");
    expect(innerBlocks.dataset.allowed).toBe("kotlinskidev/process-step");
    expect(innerBlocks.dataset.templateLength).toBe("3");
  });

  it("shows the current step count", () => {
    render(<Edit clientId="parent" />);

    expect(screen.getByText("3 step(s)")).toBeInTheDocument();
  });

  it("inserts a new process-step block on Add Step", async () => {
    const user = userEvent.setup();
    render(<Edit clientId="parent" />);

    await user.click(screen.getByRole("button", { name: "+ Add Step" }));

    expect(mockInsertBlock).toHaveBeenCalledWith(
      { name: "kotlinskidev/process-step" },
      undefined,
      "parent"
    );
  });

  it("removes the last step on Remove Last Step", async () => {
    const user = userEvent.setup();
    render(<Edit clientId="parent" />);

    await user.click(screen.getByRole("button", { name: "Remove Last Step" }));

    expect(mockRemoveBlock).toHaveBeenCalledWith("c");
  });

  it("hides Remove Last Step when only one step remains", () => {
    mockBlocks = { parent: { innerBlocks: [{ clientId: "a" }] } };
    render(<Edit clientId="parent" />);

    expect(screen.queryByRole("button", { name: "Remove Last Step" })).not.toBeInTheDocument();
  });
});
