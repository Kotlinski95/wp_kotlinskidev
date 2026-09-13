import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInnerBlocksProps: (blockProps: Record<string, unknown>, options: { template: unknown[] }) => ({
    ...blockProps,
    "data-testid": "inner-blocks",
    "data-template-length": options.template.length,
  }),
}));

interface ModalPost {
  id: number;
  title: { rendered: string };
}

const mockRecords: { current: ModalPost[] | null } = { current: null };

register(
  createReduxStore("core", {
    reducer: (state = {}) => state,
    selectors: {
      getEntityRecords: () => mockRecords.current,
    },
  })
);

import Edit from "./edit";

describe("marquee/item Edit", () => {
  beforeEach(() => {
    mockRecords.current = null;
  });

  it("renders an InnerBlocks area seeded with a single group (image above label) template", () => {
    render(<Edit attributes={{ modalId: 0 }} setAttributes={jest.fn()} />);

    const innerBlocks = screen.getByTestId("inner-blocks");
    expect(innerBlocks.dataset.templateLength).toBe("1");
  });

  it("defaults the modal picker to None (not clickable)", () => {
    mockRecords.current = [];
    render(<Edit attributes={{ modalId: 0 }} setAttributes={jest.fn()} />);

    expect(screen.getByRole("combobox", { name: "Open on click" })).toHaveValue("0");
    expect(screen.getByRole("option", { name: "— None (not clickable) —" })).toBeInTheDocument();
  });

  it("lists published modals by title in the picker", () => {
    mockRecords.current = [
      { id: 5, title: { rendered: "React impact summary" } },
      { id: 6, title: { rendered: "" } },
    ];

    render(<Edit attributes={{ modalId: 0 }} setAttributes={jest.fn()} />);

    expect(screen.getByRole("option", { name: "React impact summary" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "6" })).toBeInTheDocument();
  });

  it("selecting a modal sets modalId as a number", async () => {
    mockRecords.current = [{ id: 5, title: { rendered: "React impact summary" } }];
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={{ modalId: 0 }} setAttributes={setAttributes} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Open on click" }), "5");

    expect(setAttributes).toHaveBeenCalledWith({ modalId: 5 });
  });
});
