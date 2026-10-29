import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: () => <div data-testid="inner-blocks" />,
}));

const mockCreateBlock = jest.fn(() => ({ name: "kotlinskidev/holder" }));

jest.mock("@wordpress/blocks", () => ({
  createBlock: (...args: unknown[]) => mockCreateBlock(...args),
}));

interface HolderBlock {
  clientId: string;
  innerBlocks: unknown[];
}

const mockBlocks: Record<string, { innerBlocks: HolderBlock[] } | undefined> = {};
const mockInsertBlock = jest.fn();
const mockRemoveBlocks = jest.fn();

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    actions: {
      insertBlock: (...args: unknown[]) => {
        mockInsertBlock(...args);
        return { type: "NOOP" };
      },
      removeBlocks: (...args: unknown[]) => {
        mockRemoveBlocks(...args);
        return { type: "NOOP" };
      },
    },
    selectors: {
      getBlock: (_state: unknown, clientId: string) => mockBlocks[clientId],
    },
  })
);

import Edit from "./edit";

function holders(count: number, contentAt: number[] = []): HolderBlock[] {
  return Array.from({ length: count }, (_, i) => ({
    clientId: `holder-${i}`,
    innerBlocks: contentAt.includes(i) ? [{}] : [],
  }));
}

function setup(
  innerBlocks: HolderBlock[],
  attributes: { label?: string; mobileColumns?: number; tabletColumns?: number } = {}
) {
  mockBlocks["1"] = { innerBlocks };
  const setAttributes = jest.fn();
  const utils = render(
    <Edit clientId="1" attributes={{ label: "", ...attributes }} setAttributes={setAttributes} />
  );
  return { ...utils, setAttributes };
}

describe("simple-grid Edit", () => {
  beforeEach(() => {
    mockCreateBlock.mockClear();
    mockInsertBlock.mockClear();
    mockRemoveBlocks.mockClear();
    Object.keys(mockBlocks).forEach((key) => delete mockBlocks[key]);
  });

  it("reflects the current holder count in the Columns select and CSS variable", () => {
    const { container } = setup(holders(3));

    expect(screen.getByRole("combobox", { name: "Columns" })).toHaveValue("3");
    expect(
      (container.querySelector(".kt-simple-grid") as HTMLElement).style.getPropertyValue(
        "--kt-sg-cols"
      )
    ).toBe("3");
  });

  it("lists default column choices merged with the current count", () => {
    setup(holders(5));

    const options = within(screen.getByRole("combobox", { name: "Columns" })).getAllByRole(
      "option"
    );
    expect(options.map((o) => o.textContent)).toEqual(["2", "3", "4", "5"]);
  });

  it("updates the Nav label", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup(holders(2));

    await user.type(screen.getByLabelText("Nav label"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ label: "X" });
  });

  it("inserts holder blocks when increasing the column count", async () => {
    const user = userEvent.setup();
    setup(holders(2));

    await user.selectOptions(screen.getByRole("combobox", { name: "Columns" }), "4");

    expect(mockInsertBlock).toHaveBeenCalledTimes(2);
    expect(mockInsertBlock).toHaveBeenCalledWith({ name: "kotlinskidev/holder" }, undefined, "1");
  });

  it("removes holder blocks directly when decreasing to empty columns", async () => {
    const user = userEvent.setup();
    setup(holders(4));

    await user.selectOptions(screen.getByRole("combobox", { name: "Columns" }), "2");

    expect(mockRemoveBlocks).toHaveBeenCalledWith(["holder-2", "holder-3"]);
  });

  it("asks for confirmation before removing columns that still have content", async () => {
    const user = userEvent.setup();
    setup(holders(3, [2]));

    await user.selectOptions(screen.getByRole("combobox", { name: "Columns" }), "2");

    expect(mockRemoveBlocks).not.toHaveBeenCalled();
    expect(screen.getByText("Reduce columns?")).toBeInTheDocument();
  });

  it("cancels the pending removal without deleting anything", async () => {
    const user = userEvent.setup();
    setup(holders(3, [2]));
    await user.selectOptions(screen.getByRole("combobox", { name: "Columns" }), "2");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockRemoveBlocks).not.toHaveBeenCalled();
    expect(screen.queryByText("Reduce columns?")).not.toBeInTheDocument();
  });

  it("removes the pending columns once the removal is confirmed", async () => {
    const user = userEvent.setup();
    setup(holders(3, [2]));
    await user.selectOptions(screen.getByRole("combobox", { name: "Columns" }), "2");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(mockRemoveBlocks).toHaveBeenCalledWith(["holder-2"]);
    expect(screen.queryByText("Reduce columns?")).not.toBeInTheDocument();
  });

  it("hides the 2-column mobile option when there is only 1 column", () => {
    setup(holders(1));

    const options = within(screen.getByRole("combobox", { name: "Mobile layout" })).getAllByRole(
      "option"
    );
    expect(options.map((o) => o.textContent)).toEqual(["Same as desktop", "1 column"]);
  });

  it("shows the 2-column mobile option once there are at least 2 columns", () => {
    setup(holders(2));

    const options = within(screen.getByRole("combobox", { name: "Mobile layout" })).getAllByRole(
      "option"
    );
    expect(options.map((o) => o.textContent)).toEqual(["Same as desktop", "1 column", "2 columns"]);
  });

  it("sets mobileColumns from the select, clearing it back to undefined for 'Same as desktop'", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup(holders(2), { mobileColumns: 2 });

    await user.selectOptions(screen.getByRole("combobox", { name: "Mobile layout" }), "1 column");
    expect(setAttributes).toHaveBeenLastCalledWith({ mobileColumns: 1 });

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Mobile layout" }),
      "Same as desktop"
    );
    expect(setAttributes).toHaveBeenLastCalledWith({ mobileColumns: undefined });
  });

  it("lists a tablet-layout option for every column from 1 up to the current count", () => {
    setup(holders(3));

    const options = within(screen.getByRole("combobox", { name: "Tablet layout" })).getAllByRole(
      "option"
    );
    expect(options.map((o) => o.textContent)).toEqual([
      "Same as desktop",
      "1 column",
      "2 columns",
      "3 columns",
    ]);
  });

  it("sets tabletColumns from the select, clearing it back to undefined for 'Same as desktop'", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup(holders(3), { tabletColumns: 2 });

    await user.selectOptions(screen.getByRole("combobox", { name: "Tablet layout" }), "2 columns");
    expect(setAttributes).toHaveBeenLastCalledWith({ tabletColumns: 2 });

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Tablet layout" }),
      "Same as desktop"
    );
    expect(setAttributes).toHaveBeenLastCalledWith({ tabletColumns: undefined });
  });
});
