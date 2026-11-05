import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorAdvancedControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("position-z-index-controls — blocks.registerBlockType filter", () => {
  it("adds kotlinskidevPosition/kotlinskidevZIndex attributes with empty-string defaults, preserving existing attributes", () => {
    const settings = { name: "core/group", attributes: { existing: { type: "string" } } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        kotlinskidevPosition: { type: string; default: string };
        kotlinskidevZIndex: { type: string; default: string };
      };
    };

    expect(result.attributes.existing).toEqual({ type: "string" });
    expect(result.attributes.kotlinskidevPosition).toEqual({ type: "string", default: "" });
    expect(result.attributes.kotlinskidevZIndex).toEqual({ type: "string", default: "" });
  });

  it("skips a dynamic-preview block with no carve-out", () => {
    const settings = { name: "kotlinskidev/article-card", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, unknown>;
    };

    expect(result.attributes.kotlinskidevPosition).toBeUndefined();
    expect(result.attributes.kotlinskidevZIndex).toBeUndefined();
  });

  it("adds the attributes for kotlinskidev/certificate, its carved-out dynamic-preview block", () => {
    const settings = { name: "kotlinskidev/certificate", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { kotlinskidevPosition: { type: string }; kotlinskidevZIndex: { type: string } };
    };

    expect(result.attributes.kotlinskidevPosition).toEqual({ type: "string", default: "" });
    expect(result.attributes.kotlinskidevZIndex).toEqual({ type: "string", default: "" });
  });
});

describe("position-z-index-controls — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: { kotlinskidevPosition?: string; kotlinskidevZIndex?: string };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders the original edit plus Position and z-index selects, defaulting to empty", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Position/ })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: /Stacking order/ })).toHaveValue("");
  });

  it("reflects existing attribute values", () => {
    renderWrapped({
      attributes: { kotlinskidevPosition: "absolute", kotlinskidevZIndex: "2" },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("combobox", { name: /Position/ })).toHaveValue("absolute");
    expect(screen.getByRole("combobox", { name: /Stacking order/ })).toHaveValue("2");
  });

  it("calls setAttributes with the new position on change", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes });

    await user.selectOptions(screen.getByRole("combobox", { name: /Position/ }), "relative");

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevPosition: "relative" });
  });

  it("calls setAttributes with the new z-index on change", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes });

    await user.selectOptions(screen.getByRole("combobox", { name: /Stacking order/ }), "below");

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevZIndex: "below" });
  });

  it("bypasses entirely for a dynamic-preview block with no carve-out", () => {
    renderWrapped({ name: "kotlinskidev/article-card", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /Position/ })).not.toBeInTheDocument();
  });

  it("renders the controls for kotlinskidev/certificate, its carved-out dynamic-preview block", () => {
    renderWrapped({ name: "kotlinskidev/certificate", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByRole("combobox", { name: /Position/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Stacking order/ })).toBeInTheDocument();
  });
});

describe("position-z-index-controls — editor.BlockListBlock filter", () => {
  function OriginalBlockListBlock(props: { className?: string }) {
    return <div data-testid="block-list-block" className={props.className} />;
  }

  it("adds no class when both attributes are empty", () => {
    const Wrapped = applyFilters("editor.BlockListBlock", OriginalBlockListBlock) as ComponentType<{
      attributes: Record<string, unknown>;
      className?: string;
    }>;

    render(<Wrapped attributes={{}} />);

    expect(screen.getByTestId("block-list-block")).not.toHaveAttribute("class");
  });

  it("adds kt-position-* and kt-z-* classes when both attributes are set", () => {
    const Wrapped = applyFilters("editor.BlockListBlock", OriginalBlockListBlock) as ComponentType<{
      attributes: Record<string, unknown>;
      className?: string;
    }>;

    render(
      <Wrapped
        attributes={{ kotlinskidevPosition: "absolute", kotlinskidevZIndex: "below" }}
        className="existing"
      />
    );

    expect(screen.getByTestId("block-list-block")).toHaveAttribute(
      "class",
      "existing kt-position-absolute kt-z-below"
    );
  });
});
