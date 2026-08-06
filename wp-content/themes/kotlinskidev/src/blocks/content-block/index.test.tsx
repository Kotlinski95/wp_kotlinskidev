import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";
import { createReduxStore, register } from "@wordpress/data";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface ReusableBlockPost {
  id: number;
  slug: string;
  title: { rendered: string };
}

const mockRecords: { current: ReusableBlockPost[] | null } = { current: null };

register(
  createReduxStore("core", {
    reducer: (state = {}) => state,
    selectors: {
      getEntityRecords: () => mockRecords.current,
    },
  })
);

import "./index";

function getEdit() {
  return (registerBlockType as jest.Mock).mock.calls[0][1].edit;
}

describe("kotlinskidev/content-block", () => {
  it("registers the block with a contentSlug attribute and a null save", () => {
    mockRecords.current = null;

    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/content-block",
      expect.objectContaining({
        title: "Content Block",
        attributes: expect.objectContaining({ contentSlug: { type: "string", default: "" } }),
      })
    );
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];
    expect(save()).toBeNull();
  });

  it("shows a loading option while reusable blocks have not loaded yet", () => {
    mockRecords.current = null;
    const Edit = getEdit();

    render(<Edit attributes={{ contentSlug: "", className: "" }} setAttributes={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Loading…" })).toBeInTheDocument();
  });

  it("lists reusable blocks by title once loaded", () => {
    mockRecords.current = [
      { id: 1, slug: "footer-cta", title: { rendered: "Footer CTA" } },
      { id: 2, slug: "no-title", title: { rendered: "" } },
    ];
    const Edit = getEdit();

    render(<Edit attributes={{ contentSlug: "", className: "" }} setAttributes={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Footer CTA" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "no-title" })).toBeInTheDocument();
  });

  it("shows the selected content slug as the placeholder label", () => {
    mockRecords.current = [];
    const Edit = getEdit();

    render(
      <Edit attributes={{ contentSlug: "footer-cta", className: "" }} setAttributes={jest.fn()} />
    );

    expect(screen.getByText("footer-cta")).toBeInTheDocument();
  });

  it("falls back to the block title as the placeholder label when nothing is selected", () => {
    mockRecords.current = [];
    const Edit = getEdit();

    render(<Edit attributes={{ contentSlug: "", className: "" }} setAttributes={jest.fn()} />);

    expect(screen.getAllByText("Content Block").length).toBeGreaterThan(0);
  });

  it("updates contentSlug when a reusable block is selected", async () => {
    mockRecords.current = [{ id: 1, slug: "footer-cta", title: { rendered: "Footer CTA" } }];
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(<Edit attributes={{ contentSlug: "", className: "" }} setAttributes={setAttributes} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Reusable block" }),
      "footer-cta"
    );

    expect(setAttributes).toHaveBeenCalledWith({ contentSlug: "footer-cta" });
  });
});
