import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("text-line-clamp — blocks.registerBlockType filter", () => {
  it("leaves settings unchanged for a block that is not core/paragraph", () => {
    const settings = { name: "core/group", supports: {}, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the line-clamp attributes for core/paragraph", () => {
    const settings = { name: "core/paragraph", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        kotlinskidevLineClampEnabled: { type: string; default: boolean };
        kotlinskidevLineClampLines: { type: string; default: number };
      };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.kotlinskidevLineClampEnabled).toEqual({
      type: "boolean",
      default: false,
    });
    expect(result.attributes.kotlinskidevLineClampLines).toEqual({ type: "number", default: 3 });
  });
});

describe("text-line-clamp — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { kotlinskidevLineClampEnabled?: boolean; kotlinskidevLineClampLines?: number };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders only the original edit for a non-paragraph block", () => {
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Truncate Text")).not.toBeInTheDocument();
  });

  it("renders the toggle for a paragraph block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByText("Truncate Text")).toBeInTheDocument();
  });

  it("only shows the lines range control once enabled", () => {
    renderWrapped({
      name: "core/paragraph",
      attributes: { kotlinskidevLineClampEnabled: false },
      setAttributes: jest.fn(),
    });

    expect(screen.queryByText("Visible lines")).not.toBeInTheDocument();
  });

  it("shows the lines range control when already enabled", () => {
    renderWrapped({
      name: "core/paragraph",
      attributes: { kotlinskidevLineClampEnabled: true, kotlinskidevLineClampLines: 5 },
      setAttributes: jest.fn(),
    });
    fireEvent.click(screen.getByRole("button", { name: /Truncate Text/ }));

    expect(screen.getByText("Visible lines")).toBeInTheDocument();
  });

  it("calls setAttributes when the toggle is switched on", () => {
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes });
    fireEvent.click(screen.getByRole("button", { name: /Truncate Text/ }));

    fireEvent.click(screen.getByRole("checkbox", { name: "Limit to a number of lines" }));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevLineClampEnabled: true });
  });
});

describe("text-line-clamp — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: { kotlinskidevLineClampEnabled?: boolean; kotlinskidevLineClampLines?: number };
    wrapperProps?: Record<string, unknown>;
  }

  function OriginalBlockListBlock(props: Props) {
    return <div data-testid="block-list-block" data-style={JSON.stringify(props.wrapperProps)} />;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("leaves wrapperProps untouched when line-clamp is disabled", () => {
    renderWrapped({ attributes: {}, wrapperProps: { className: "existing" } });

    const data = JSON.parse(
      screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}"
    );
    expect(data).toEqual({ className: "existing" });
  });

  it("merges the clamp preview style into existing wrapperProps", () => {
    renderWrapped({
      attributes: { kotlinskidevLineClampEnabled: true, kotlinskidevLineClampLines: 4 },
      wrapperProps: { className: "existing", style: { color: "red" } },
    });

    const data = JSON.parse(
      screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}"
    );
    expect(data).toEqual({
      className: "existing",
      style: {
        color: "red",
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: 4,
        overflow: "hidden",
      },
    });
  });
});
