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
  PanelColorGradientSettings: ({ settings }: { settings: MockControlProps[] }) => {
    lastControlProps = settings[0];
    return <div data-testid="color-gradient-control" />;
  },
}));

import "./index";

describe("text-gradient — blocks.registerBlockType filter", () => {
  it("leaves a block with color.text support disabled unchanged", () => {
    const settings = { name: "core/group", supports: { color: { text: false } }, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("leaves a block with no color support unchanged", () => {
    const settings = { name: "core/group", supports: {}, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("leaves a block whose supports.color is a plain boolean unchanged", () => {
    const settings = { name: "kotlinskidev/button", supports: { color: false }, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the textGradient attribute when supports.color has no explicit text key (WordPress core's own default-enabled-unless-false model)", () => {
    const settings = {
      name: "core/paragraph",
      supports: { color: { gradients: true, link: true } },
      attributes: {},
    };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { textGradient: { type: string; default: string } };
    };

    expect(result.attributes.textGradient).toEqual({ type: "string", default: "" });
  });

  it("adds the textGradient attribute when supports.color.text is true", () => {
    const settings = {
      name: "core/paragraph",
      supports: { color: { text: true } },
      attributes: {},
    };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { textGradient: { type: string; default: string } };
    };

    expect(result.attributes.textGradient).toEqual({ type: "string", default: "" });
  });

  it("adds the textGradient attribute when only __experimentalColor.text is set", () => {
    const settings = {
      name: "core/heading",
      supports: { __experimentalColor: { text: true } },
      attributes: {},
    };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { textGradient: unknown };
    };

    expect(result.attributes.textGradient).toBeDefined();
  });
});

describe("text-gradient — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: {
      textGradient?: string;
      textColor?: string;
      style?: { color?: { text?: string } };
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

  it("renders the gradient control for any named block, reflecting current values", () => {
    renderWrapped({
      name: "core/paragraph",
      attributes: {
        style: { color: { text: "#111111" } },
        textGradient: "linear-gradient(a,b)",
      },
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("color-gradient-control")).toBeInTheDocument();
    expect(lastControlProps?.colorValue).toBe("#111111");
    expect(lastControlProps?.gradientValue).toBe("linear-gradient(a,b)");
  });

  it("sets the text color under style.color and clears the legacy textColor + any gradient", () => {
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: { textGradient: "linear-gradient(a,b)" },
      setAttributes,
    });

    lastControlProps?.onColorChange("#222222");

    expect(setAttributes).toHaveBeenCalledWith({
      textColor: undefined,
      textGradient: "",
      style: { color: { text: "#222222" } },
    });
  });

  it("does not clear an already-set gradient when the control internally fires onColorChange(undefined) right after onGradientChange", () => {
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: { textGradient: "linear-gradient(a,b)" },
      setAttributes,
    });

    lastControlProps?.onColorChange(undefined);

    expect(setAttributes).toHaveBeenCalledWith({
      textColor: undefined,
      textGradient: "linear-gradient(a,b)",
      style: { color: { text: undefined } },
    });
  });

  it("keeps a gradient picked this same tick even when onColorChange(undefined) fires immediately after, before any re-render (stale-closure regression)", () => {
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: {},
      setAttributes,
    });

    lastControlProps?.onGradientChange("linear-gradient(red, blue)");
    lastControlProps?.onColorChange(undefined);

    expect(setAttributes).toHaveBeenLastCalledWith({
      textColor: undefined,
      textGradient: "linear-gradient(red, blue)",
      style: { color: { text: undefined } },
    });
  });

  it("keeps a color picked this same tick even when onGradientChange(undefined) fires immediately after, before any re-render (stale-closure regression)", () => {
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: {},
      setAttributes,
    });

    lastControlProps?.onColorChange("#222222");
    lastControlProps?.onGradientChange(undefined);

    expect(setAttributes).toHaveBeenLastCalledWith({
      textGradient: "",
      textColor: undefined,
      style: { color: { text: "#222222" } },
    });
  });

  it("updates the text gradient attribute and clears the legacy textColor", () => {
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: { textColor: "primary" },
      setAttributes,
    });

    lastControlProps?.onGradientChange("linear-gradient(red, blue)");

    expect(setAttributes).toHaveBeenCalledWith({
      textGradient: "linear-gradient(red, blue)",
      textColor: undefined,
      style: { color: { text: undefined } },
    });
  });

  it("clears the gradient to an empty string when cleared", () => {
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/paragraph", attributes: { textColor: "primary" }, setAttributes });

    lastControlProps?.onGradientChange(undefined);

    expect(setAttributes).toHaveBeenCalledWith({
      textGradient: "",
      textColor: "primary",
      style: { color: { text: "primary" } },
    });
  });
});

describe("text-gradient — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: { textGradient?: string };
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

  it("leaves the block unchanged when there is no text gradient", () => {
    renderWrapped({ attributes: {}, className: "existing" });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing");
    expect(el.getAttribute("data-style")).toBe("{}");
  });

  it("adds the gradient-text class and CSS variable when a gradient is set", () => {
    renderWrapped({
      attributes: { textGradient: "linear-gradient(red, blue)" },
      className: "existing",
    });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing kt-gradient-text");
    expect(JSON.parse(el.getAttribute("data-style") ?? "{}")).toEqual({
      "--kt-text-gradient": "linear-gradient(red, blue)",
    });
  });
});
