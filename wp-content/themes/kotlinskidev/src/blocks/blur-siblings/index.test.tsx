import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSettings: () => [undefined],
}));

import "./index";

describe("blur-siblings — blocks.registerBlockType filter", () => {
  it("adds the blur-siblings attributes for core/columns", () => {
    const settings = { name: "core/columns", supports: {}, attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, unknown>;
    };

    expect(result.attributes.kotlinskidevBlurSiblings).toEqual({
      type: "boolean",
      default: false,
    });
    expect(result.attributes.kotlinskidevBlurSiblingsNested).toEqual({
      type: "boolean",
      default: false,
    });
  });

  it("adds the blur-siblings attributes for core/column", () => {
    const settings = { name: "core/column", supports: {}, attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, unknown>;
    };

    expect(result.attributes.kotlinskidevBlurSiblings).toEqual({
      type: "boolean",
      default: false,
    });
  });

  it("leaves settings unchanged for an unsupported block", () => {
    const settings = { name: "core/paragraph", supports: {}, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });
});

describe("blur-siblings — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: Record<string, unknown>;
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    const result = render(<Wrapped {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Blur Siblings on Hover/ }));
    return result;
  }

  it("does not show the nested toggle when blur siblings is off", () => {
    renderWrapped({ name: "core/columns", attributes: {}, setAttributes: jest.fn() });

    expect(screen.queryByText("Include nested columns")).not.toBeInTheDocument();
  });

  it("shows the nested toggle for core/columns once blur siblings is on", () => {
    renderWrapped({
      name: "core/columns",
      attributes: { kotlinskidevBlurSiblings: true },
      setAttributes: jest.fn(),
    });

    expect(screen.getByText("Include nested columns")).toBeInTheDocument();
  });

  it("shows the nested toggle for core/column once blur siblings is on", () => {
    renderWrapped({
      name: "core/column",
      attributes: { kotlinskidevBlurSiblings: true },
      setAttributes: jest.fn(),
    });

    expect(screen.getByText("Include nested columns")).toBeInTheDocument();
  });

  it("does not show the nested toggle for core/group even with blur siblings on", () => {
    renderWrapped({
      name: "core/group",
      attributes: { kotlinskidevBlurSiblings: true },
      setAttributes: jest.fn(),
    });

    expect(screen.queryByText("Include nested columns")).not.toBeInTheDocument();
  });

  it("calls setAttributes when the nested toggle is flipped", () => {
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/columns",
      attributes: { kotlinskidevBlurSiblings: true },
      setAttributes,
    });

    fireEvent.click(screen.getByLabelText("Include nested columns"));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevBlurSiblingsNested: true });
  });
});

describe("blur-siblings — blocks.getSaveContent.extraProps filter", () => {
  function applyProps(attributes: Record<string, unknown>) {
    return applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      { name: "core/columns" },
      attributes
    ) as { className?: string; style?: Record<string, unknown> };
  }

  it("adds no class when blur siblings is off", () => {
    expect(applyProps({}).className).toBeUndefined();
  });

  it("adds only has-blur-siblings when nested is off", () => {
    expect(applyProps({ kotlinskidevBlurSiblings: true }).className).toBe("has-blur-siblings");
  });

  it("adds has-blur-siblings-nested when nested is on", () => {
    expect(
      applyProps({ kotlinskidevBlurSiblings: true, kotlinskidevBlurSiblingsNested: true }).className
    ).toBe("has-blur-siblings has-blur-siblings-nested");
  });
});
