import React from "react";
import { render, screen } from "@testing-library/react";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

interface MockControlProps {
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (v?: string) => void;
  onGradientChange: (v?: string) => void;
}

let lastControlProps: MockControlProps | null = null;

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("../shared/color-gradient-control", () => ({
  ColorGradientControl: (props: MockControlProps) => {
    lastControlProps = props;
    return <div data-testid="color-gradient-control" />;
  },
}));

import "./index";

describe("border-gradient — blocks.registerBlockType filter", () => {
  it("leaves the excluded button block unchanged", () => {
    const settings = { name: "kotlinskidev/button", supports: { border: true }, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("leaves a block with no border support unchanged", () => {
    const settings = { name: "core/group", supports: {}, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the borderGradient attribute when supports.border is true", () => {
    const settings = { name: "core/group", supports: { border: true }, attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { borderGradient: { type: string; default: string } };
    };

    expect(result.attributes.borderGradient).toEqual({ type: "string", default: "" });
  });

  it("adds the borderGradient attribute when only __experimentalBorder is set", () => {
    const settings = {
      name: "core/group",
      supports: { __experimentalBorder: true },
      attributes: {},
    };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { borderGradient: unknown };
    };

    expect(result.attributes.borderGradient).toBeDefined();
  });
});

describe("border-gradient — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: {
      borderGradient?: string;
      borderColor?: string;
      style?: { border?: { color?: string; width?: string } };
    };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  afterEach(() => {
    lastControlProps = null;
  });

  it("renders only the original edit for the excluded button block", () => {
    renderWrapped({ name: "kotlinskidev/button", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByTestId("color-gradient-control")).not.toBeInTheDocument();
  });

  it("renders the gradient control for a supported block, reflecting current values", () => {
    renderWrapped({
      name: "core/group",
      attributes: {
        style: { border: { color: "#111111" } },
        borderGradient: "linear-gradient(a,b)",
      },
      setAttributes: jest.fn(),
    });

    expect(lastControlProps?.colorValue).toBe("#111111");
    expect(lastControlProps?.gradientValue).toBe("linear-gradient(a,b)");
  });

  it("sets the border color under style.border and clears the legacy borderColor attribute", () => {
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/group",
      attributes: { style: { border: { width: "2px" } } },
      setAttributes,
    });

    lastControlProps?.onColorChange("#222222");

    expect(setAttributes).toHaveBeenCalledWith({
      borderColor: undefined,
      style: { border: { width: "2px", color: "#222222" } },
    });
  });

  it("updates the border gradient attribute", () => {
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    lastControlProps?.onGradientChange("linear-gradient(red, blue)");

    expect(setAttributes).toHaveBeenCalledWith({ borderGradient: "linear-gradient(red, blue)" });
  });

  it("clears the gradient to an empty string when cleared", () => {
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    lastControlProps?.onGradientChange(undefined);

    expect(setAttributes).toHaveBeenCalledWith({ borderGradient: "" });
  });

  it("clears an existing gradient once the native border color changes", () => {
    const setAttributes = jest.fn();
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    const { rerender } = render(
      <Wrapped
        name="core/group"
        attributes={{
          style: { border: { color: "#111111" } },
          borderGradient: "linear-gradient(a,b)",
        }}
        setAttributes={setAttributes}
      />
    );

    rerender(
      <Wrapped
        name="core/group"
        attributes={{
          style: { border: { color: "#999999" } },
          borderGradient: "linear-gradient(a,b)",
        }}
        setAttributes={setAttributes}
      />
    );

    expect(setAttributes).toHaveBeenCalledWith({ borderGradient: "" });
  });
});

describe("border-gradient — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: { borderGradient?: string; style?: { border?: { width?: string } } };
    className?: string;
    wrapperProps?: Record<string, unknown>;
  }

  function OriginalBlockListBlock(props: Props) {
    return (
      <div
        data-testid="block-list-block"
        className={props.className}
        data-style={JSON.stringify(props.wrapperProps?.style ?? {})}
      />
    );
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("leaves the block unchanged when there is no border gradient", () => {
    renderWrapped({ attributes: {}, className: "existing" });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing");
    expect(el.getAttribute("data-style")).toBe("{}");
  });

  it("adds the gradient class and CSS variable when a gradient is set", () => {
    renderWrapped({
      attributes: {
        borderGradient: "linear-gradient(red, blue)",
        style: { border: { width: "3px" } },
      },
      className: "existing",
    });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing kt-has-gradient-border");
    expect(JSON.parse(el.getAttribute("data-style") ?? "{}")).toEqual({
      "--kt-border-gradient": "linear-gradient(red, blue)",
      "--kt-border-width": "3px",
    });
  });
});
