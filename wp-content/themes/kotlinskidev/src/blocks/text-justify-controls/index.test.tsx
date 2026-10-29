import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  BlockControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

function OriginalEdit() {
  return <div data-testid="original-edit" />;
}

interface Props {
  name: string;
  attributes: { style?: { typography?: { textAlign?: string } } };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

function renderWrapped(props: Props) {
  const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
  return render(<Wrapped {...props} />);
}

describe("text-justify-controls", () => {
  it("renders only the original edit for an unsupported block", () => {
    renderWrapped({ name: "core/image", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Justify text" })).not.toBeInTheDocument();
  });

  it("shows the justify toolbar button for a supported block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByRole("button", { name: "Justify text" })).toBeInTheDocument();
  });

  it("marks the button inactive when the current text align is not justify", () => {
    renderWrapped({
      name: "core/heading",
      attributes: { style: { typography: { textAlign: "left" } } },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("button", { name: "Justify text" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("marks the button active when the current text align is justify", () => {
    renderWrapped({
      name: "core/paragraph",
      attributes: { style: { typography: { textAlign: "justify" } } },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("button", { name: "Justify text" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("sets textAlign to justify, preserving other typography settings, when toggled on", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/paragraph",
      attributes: { style: { typography: { fontSize: "16px" } } },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Justify text" }));

    expect(setAttributes).toHaveBeenCalledWith({
      style: { typography: { fontSize: "16px", textAlign: "justify" } },
    });
  });

  it("clears textAlign when toggled off from justify", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/paragraph",
      attributes: { style: { typography: { textAlign: "justify" } } },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Justify text" }));

    expect(setAttributes).toHaveBeenCalledWith({
      style: { typography: { textAlign: undefined } },
    });
  });
});
