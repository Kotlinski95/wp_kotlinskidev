import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSettings: () => [[{ name: "Small", slug: "small", size: "13px" }]],
}));

import "./index";

function getEdit() {
  return (registerBlockType as jest.Mock).mock.calls[0][1].edit;
}

async function renderEdit(props: {
  attributes: Record<string, unknown>;
  setAttributes: () => void;
}) {
  const Edit = getEdit();
  const result = render(<Edit {...props} />);
  await act(async () => {});
  return result;
}

describe("popular-pages registration", () => {
  it("registers both the popular-pages and nav-popular-pages blocks with the same edit component", () => {
    const Edit = getEdit();

    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/popular-pages" }),
      expect.objectContaining({ edit: Edit })
    );
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/nav-popular-pages" }),
      expect.objectContaining({ edit: Edit })
    );
  });

  it("saves nothing for both blocks, since they are server-rendered", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(save()).toBeNull();
  });
});

describe("PopularPagesEdit", () => {
  it("shows one preview pill per configured count, up to 5", async () => {
    await renderEdit({ attributes: { title: "", count: 3 }, setAttributes: jest.fn() });

    expect(screen.getAllByText("Page title")).toHaveLength(3);
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it("caps preview pills at 5 and shows a remainder count", async () => {
    await renderEdit({ attributes: { title: "", count: 8 }, setAttributes: jest.fn() });

    expect(screen.getByText("+3", { exact: false })).toBeInTheDocument();
  });

  it("does not render a title line when the title is empty", async () => {
    const { container } = await renderEdit({
      attributes: { title: "", count: 3 },
      setAttributes: jest.fn(),
    });

    expect(container.querySelector("p")).toBeNull();
  });

  it("renders the configured title", async () => {
    await renderEdit({
      attributes: { title: "Popular Reads", count: 3 },
      setAttributes: jest.fn(),
    });

    expect(screen.getByText("Popular Reads")).toBeInTheDocument();
  });

  it("updates the title via the text control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    await renderEdit({ attributes: { title: "", count: 3 }, setAttributes });
    await user.type(screen.getByLabelText("Title"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ title: "X" });
  });

  it("updates the count via the range control", async () => {
    const setAttributes = jest.fn();

    await renderEdit({ attributes: { title: "", count: 3 }, setAttributes });
    const range = screen.getByRole("slider", { name: "Number of pages" });
    fireEvent.change(range, { target: { value: "7" } });

    expect(setAttributes).toHaveBeenCalledWith({ count: 7 });
  });

  it("passes theme font sizes into the font size picker, which is open by default", async () => {
    await renderEdit({ attributes: { title: "", count: 3 }, setAttributes: jest.fn() });

    expect(screen.getByRole("radio", { name: "Small" })).toBeInTheDocument();
  });
});
