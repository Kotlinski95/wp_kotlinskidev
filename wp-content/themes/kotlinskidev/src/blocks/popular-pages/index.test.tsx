import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("popular-pages registration", () => {
  it("registers both the popular-pages and nav-popular-pages blocks with the same edit component", () => {
    const Edit = getEdit();

    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/popular-pages",
      expect.objectContaining({ edit: Edit })
    );
    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/nav-popular-pages",
      expect.objectContaining({ edit: Edit })
    );
  });

  it("saves nothing for both blocks, since they are server-rendered", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(save()).toBeNull();
  });
});

describe("PopularPagesEdit", () => {
  it("shows one preview pill per configured count, up to 5", () => {
    const Edit = getEdit();

    const { container } = render(
      <Edit attributes={{ title: "", count: 3 }} setAttributes={jest.fn()} />
    );

    const pillsWrapper = container.querySelector('div[style*="flex-wrap"]') as HTMLElement;
    expect(pillsWrapper.querySelectorAll(":scope > span").length).toBe(3);
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it("caps preview pills at 5 and shows a remainder count", () => {
    const Edit = getEdit();

    render(<Edit attributes={{ title: "", count: 8 }} setAttributes={jest.fn()} />);

    expect(screen.getByText("+3", { exact: false })).toBeInTheDocument();
  });

  it("does not render a title line when the title is empty", () => {
    const Edit = getEdit();

    const { container } = render(
      <Edit attributes={{ title: "", count: 3 }} setAttributes={jest.fn()} />
    );

    expect(container.querySelector("p")).toBeNull();
  });

  it("renders the configured title", () => {
    const Edit = getEdit();

    render(<Edit attributes={{ title: "Popular Reads", count: 3 }} setAttributes={jest.fn()} />);

    expect(screen.getByText("Popular Reads")).toBeInTheDocument();
  });

  it("updates the title via the text control", async () => {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(<Edit attributes={{ title: "", count: 3 }} setAttributes={setAttributes} />);
    await user.type(screen.getByLabelText("Title"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ title: "X" });
  });

  it("updates the count via the range control", () => {
    const Edit = getEdit();
    const setAttributes = jest.fn();

    render(<Edit attributes={{ title: "", count: 3 }} setAttributes={setAttributes} />);
    const range = screen.getByRole("slider", { name: "Number of pages" });
    fireEvent.change(range, { target: { value: "7" } });

    expect(setAttributes).toHaveBeenCalledWith({ count: 7 });
  });

  it("passes theme font sizes into the font size picker, which is open by default", () => {
    const Edit = getEdit();

    render(<Edit attributes={{ title: "", count: 3 }} setAttributes={jest.fn()} />);

    expect(screen.getByRole("radio", { name: "Small" })).toBeInTheDocument();
  });
});
