import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

const mockThemeSpacingSizes = [
  { name: "None", slug: "none", size: "0" },
  { name: "Small", slug: "small", size: "clamp(0.5rem, 1.5vw, 1rem)" },
  { name: "Medium", slug: "medium", size: "clamp(0.75rem, 2.5vw, 1.5rem)" },
  { name: "Large", slug: "large", size: "clamp(1rem, 4vw, 2.5rem)" },
];

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: ({ allowedBlocks, template }: { allowedBlocks: string[]; template: unknown[] }) => (
    <div
      data-testid="inner-blocks"
      data-allowed={allowedBlocks.join(",")}
      data-template-length={template.length}
    />
  ),
  useSettings: () => [[], mockThemeSpacingSizes],
}));

jest.mock("@wordpress/components", () => {
  const actual = jest.requireActual("@wordpress/components");
  return {
    ...actual,
    ColorPalette: ({ onChange }: { onChange: (value: string | undefined) => void }) => (
      <div>
        <button onClick={() => onChange("#8209d3")}>pick-purple</button>
        <button onClick={() => onChange(undefined)}>clear-color</button>
      </div>
    ),
  };
});

const mockInsertBlock = jest.fn();
const mockRemoveBlock = jest.fn();
const mockBlocks: Record<string, { innerBlocks: Array<{ clientId: string }> } | undefined> = {};

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
  createBlock: jest.fn(() => ({ name: "kotlinskidev/scroll-section-item" })),
}));

import Edit from "./edit";

const baseAttributes = {
  trigger: "center" as const,
  backgroundColor: "",
  markers: false,
  slideWidth: "auto" as const,
  slideGap: "medium" as const,
};

describe("scroll-section Edit", () => {
  beforeEach(() => {
    mockInsertBlock.mockClear();
    mockRemoveBlock.mockClear();
    Object.keys(mockBlocks).forEach((key) => delete mockBlocks[key]);
  });

  it("shows the current inner-block count", () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }, { clientId: "b" }] };

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(screen.getByText("2 item(s)")).toBeInTheDocument();
  });

  it("inserts a new scroll-section-item when Add Item is clicked", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const user = userEvent.setup();

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: "+ Add Item" }));

    expect(mockInsertBlock).toHaveBeenCalledWith(
      { name: "kotlinskidev/scroll-section-item" },
      undefined,
      "1"
    );
  });

  it("also inserts a new item from the floating add button on the canvas", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const user = userEvent.setup();

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: "+", exact: true }));

    expect(mockInsertBlock).toHaveBeenCalled();
  });

  it("hides Remove Last Item when there is only one item", () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(screen.queryByRole("button", { name: "Remove Last Item" })).not.toBeInTheDocument();
  });

  it("removes the last item when Remove Last Item is clicked", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }, { clientId: "b" }] };
    const user = userEvent.setup();

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: "Remove Last Item" }));

    expect(mockRemoveBlock).toHaveBeenCalledWith("b");
  });

  it("updates the trigger point", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={setAttributes} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Trigger point" }), "top");

    expect(setAttributes).toHaveBeenCalledWith({ trigger: "top" });
  });

  it("updates the slide width and reflects it on the wrapper", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Edit clientId="1" attributes={baseAttributes} setAttributes={setAttributes} />
    );
    expect(container.querySelector(".scroll-section")).toHaveAttribute("data-slide-width", "auto");

    await user.selectOptions(screen.getByRole("combobox", { name: "Slide width" }), "full");

    expect(setAttributes).toHaveBeenCalledWith({ slideWidth: "full" });
  });

  it("shows the slide spacing control only when slide width is auto", () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };

    const { rerender } = render(
      <Edit clientId="1" attributes={baseAttributes} setAttributes={jest.fn()} />
    );
    expect(screen.getByRole("combobox", { name: "Slide spacing" })).toBeInTheDocument();

    rerender(
      <Edit
        clientId="1"
        attributes={{ ...baseAttributes, slideWidth: "full" }}
        setAttributes={jest.fn()}
      />
    );
    expect(screen.queryByRole("combobox", { name: "Slide spacing" })).not.toBeInTheDocument();
  });

  it("updates the slide gap and reflects it on the wrapper", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Edit clientId="1" attributes={baseAttributes} setAttributes={setAttributes} />
    );
    expect(container.querySelector(".scroll-section")).toHaveAttribute("data-slide-gap", "medium");

    await user.selectOptions(screen.getByRole("combobox", { name: "Slide spacing" }), "large");

    expect(setAttributes).toHaveBeenCalledWith({ slideGap: "large" });
  });

  it("toggles the markers setting", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={setAttributes} />);
    await user.click(screen.getByRole("checkbox", { name: "Show markers" }));

    expect(setAttributes).toHaveBeenCalledWith({ markers: true });
  });

  it("sets the background color and reflects it on the wrapper style", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={setAttributes} />);
    await user.click(screen.getByRole("button", { name: "pick-purple" }));

    expect(setAttributes).toHaveBeenCalledWith({ backgroundColor: "#8209d3" });
  });

  it("clears the background color to an empty string", async () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(
      <Edit
        clientId="1"
        attributes={{ ...baseAttributes, backgroundColor: "#8209d3" }}
        setAttributes={setAttributes}
      />
    );
    await user.click(screen.getByRole("button", { name: "clear-color" }));

    expect(setAttributes).toHaveBeenCalledWith({ backgroundColor: "" });
  });

  it("applies the background color as an inline style when set", () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };

    const { container } = render(
      <Edit
        clientId="1"
        attributes={{ ...baseAttributes, backgroundColor: "#8209d3" }}
        setAttributes={jest.fn()}
      />
    );

    expect((container.querySelector(".scroll-section") as HTMLElement).style.background).toBe(
      "rgb(130, 9, 211)"
    );
  });

  it("restricts inner blocks to scroll-section-item with a two-item starter template", () => {
    mockBlocks["1"] = { innerBlocks: [{ clientId: "a" }] };

    render(<Edit clientId="1" attributes={baseAttributes} setAttributes={jest.fn()} />);

    const innerBlocks = screen.getByTestId("inner-blocks");
    expect(innerBlocks).toHaveAttribute("data-allowed", "kotlinskidev/scroll-section-item");
    expect(innerBlocks).toHaveAttribute("data-template-length", "2");
  });
});
