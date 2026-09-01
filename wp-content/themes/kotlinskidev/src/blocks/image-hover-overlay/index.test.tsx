import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

interface ColorGradientControlProps {
  label: string;
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (value: string | undefined) => void;
  onGradientChange?: (value: string | undefined) => void;
}

const lastColorControlProps: Record<string, ColorGradientControlProps> = {};

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  __experimentalColorGradientControl: (props: ColorGradientControlProps) => {
    lastColorControlProps[props.label] = props;
    return (
      <div>
        <span>{props.label}</span>
        <button onClick={() => props.onColorChange("#123456")}>set-color-{props.label}</button>
        <button onClick={() => props.onColorChange(undefined)}>clear-color-{props.label}</button>
        {props.onGradientChange && (
          <>
            <button onClick={() => props.onGradientChange?.("linear-gradient(90deg,#000,#fff)")}>
              set-gradient-{props.label}
            </button>
            <button
              onClick={() => {
                // Real ColorGradientControl behavior when picking a flat swatch: it fires
                // onColorChange(value) immediately followed by onGradientChange(undefined)
                // to clear the "other" representation, in the same click.
                props.onColorChange("#123456");
                props.onGradientChange?.(undefined);
              }}
            >
              swatch-click-{props.label}
            </button>
          </>
        )}
      </div>
    );
  },
}));

import "./index";

describe("image-hover-overlay — blocks.registerBlockType filter", () => {
  it("leaves an unrelated block unchanged", () => {
    const settings = { name: "core/paragraph", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds overlay attributes to core/image", () => {
    const settings = { name: "core/image", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, { type: string; default: unknown }>;
    };

    expect(result.attributes.kotlinskidevOverlayEnabled).toEqual({
      type: "boolean",
      default: false,
    });
    expect(result.attributes.kotlinskidevOverlayHeading).toEqual({
      type: "string",
      default: "",
    });
    expect(result.attributes.kotlinskidevOverlayDescription).toEqual({
      type: "string",
      default: "",
    });
    expect(result.attributes.kotlinskidevOverlayBackgroundColor).toEqual({
      type: "string",
      default: "",
    });
    expect(result.attributes.kotlinskidevOverlayBackgroundOpacity).toEqual({
      type: "number",
      default: 100,
    });
    expect(result.attributes.kotlinskidevOverlayTextColor).toEqual({
      type: "string",
      default: "",
    });
  });
});

describe("image-hover-overlay — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: {
      kotlinskidevOverlayEnabled?: boolean;
      kotlinskidevOverlayHeading?: string;
      kotlinskidevOverlayDescription?: string;
      kotlinskidevOverlayBackgroundColor?: string;
      kotlinskidevOverlayTextColor?: string;
    };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  beforeEach(() => {
    Object.keys(lastColorControlProps).forEach((key) => delete lastColorControlProps[key]);
  });

  it("renders only the original edit for an unrelated block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Hover Overlay")).not.toBeInTheDocument();
  });

  it("shows the toggle but hides the text/color fields when disabled", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/image", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));

    expect(screen.getByLabelText("Show text overlay on hover")).not.toBeChecked();
    expect(screen.queryByLabelText("Heading")).not.toBeInTheDocument();
    expect(screen.queryByText("Overlay background color")).not.toBeInTheDocument();
  });

  it("toggling enabled reveals Heading, Description, and both color pickers", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/image", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    await user.click(screen.getByLabelText("Show text overlay on hover"));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevOverlayEnabled: true });
  });

  it("typing updates the heading and description attributes", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/image",
      attributes: { kotlinskidevOverlayEnabled: true },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    await user.type(screen.getByLabelText("Heading"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevOverlayHeading: "X" });
  });

  it("picking a background color updates kotlinskidevOverlayBackgroundColor", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/image",
      attributes: { kotlinskidevOverlayEnabled: true },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    await user.click(screen.getByText("set-color-Overlay background color"));

    expect(setAttributes).toHaveBeenCalledWith({
      kotlinskidevOverlayBackgroundColor: "#123456",
    });
  });

  it("picking a flat swatch (which also fires onGradientChange(undefined) right after) keeps the color, not empty — regression for the 'always black' bug", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/image",
      attributes: { kotlinskidevOverlayEnabled: true },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    await user.click(screen.getByText("swatch-click-Overlay background color"));

    expect(setAttributes).toHaveBeenLastCalledWith({
      kotlinskidevOverlayBackgroundColor: "#123456",
    });
    expect(setAttributes).not.toHaveBeenCalledWith({ kotlinskidevOverlayBackgroundColor: "" });
  });

  it("picking a gradient for the background is stored in the same attribute", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/image",
      attributes: { kotlinskidevOverlayEnabled: true },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    await user.click(screen.getByText("set-gradient-Overlay background color"));

    expect(setAttributes).toHaveBeenCalledWith({
      kotlinskidevOverlayBackgroundColor: "linear-gradient(90deg,#000,#fff)",
    });
  });

  it("dragging the opacity slider updates kotlinskidevOverlayBackgroundOpacity", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/image",
      attributes: { kotlinskidevOverlayEnabled: true },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    const spinbutton = screen.getByRole("spinbutton", { name: "Overlay background opacity" });
    await user.clear(spinbutton);
    await user.type(spinbutton, "40");
    await user.tab();

    expect(setAttributes).toHaveBeenCalledWith({
      kotlinskidevOverlayBackgroundOpacity: 40,
    });
  });

  it("picking a text color updates kotlinskidevOverlayTextColor", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/image",
      attributes: { kotlinskidevOverlayEnabled: true },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    await user.click(screen.getByText("set-color-Overlay text color"));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevOverlayTextColor: "#123456" });
  });

  it("clearing the background color resets it to an empty string", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/image",
      attributes: {
        kotlinskidevOverlayEnabled: true,
        kotlinskidevOverlayBackgroundColor: "#123456",
      },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Hover Overlay" }));
    await user.click(screen.getByText("clear-color-Overlay background color"));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevOverlayBackgroundColor: "" });
  });

  it("renders the always-visible editor preview only when enabled with text set", () => {
    const { rerender } = render(
      (() => {
        const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
        return (
          <Wrapped
            name="core/image"
            attributes={{ kotlinskidevOverlayEnabled: false }}
            setAttributes={jest.fn()}
          />
        );
      })()
    );

    expect(screen.queryByText("Preview Heading")).not.toBeInTheDocument();

    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    rerender(
      <Wrapped
        name="core/image"
        attributes={{
          kotlinskidevOverlayEnabled: true,
          kotlinskidevOverlayHeading: "Preview Heading",
        }}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByText("Preview Heading")).toBeInTheDocument();
  });
});

describe("image-hover-overlay — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged for an unrelated block", () => {
    const extraProps = { className: "x" };

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      { name: "core/paragraph" },
      { kotlinskidevOverlayEnabled: true, kotlinskidevOverlayBackgroundColor: "#123456" }
    );

    expect(result).toBe(extraProps);
  });

  it("leaves extraProps unchanged when the overlay is not enabled", () => {
    const extraProps = { className: "x" };

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      { name: "core/image" },
      { kotlinskidevOverlayBackgroundColor: "#123456" }
    ) as { style?: Record<string, unknown> };

    expect(result.style).toBeUndefined();
  });

  it("adds --kt-overlay-bg and --kt-overlay-text custom properties when set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "x" },
      { name: "core/image" },
      {
        kotlinskidevOverlayEnabled: true,
        kotlinskidevOverlayBackgroundColor: "#123456",
        kotlinskidevOverlayTextColor: "#abcdef",
      }
    ) as { style?: Record<string, unknown> };

    expect(result.style).toEqual({
      "--kt-overlay-bg": "#123456",
      "--kt-overlay-text": "#abcdef",
    });
  });

  it("only sets the custom property for the color that is actually set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "x" },
      { name: "core/image" },
      { kotlinskidevOverlayEnabled: true, kotlinskidevOverlayBackgroundColor: "#123456" }
    ) as { style?: Record<string, unknown> };

    expect(result.style).toEqual({ "--kt-overlay-bg": "#123456" });
  });

  it("adds --kt-overlay-bg-opacity when the opacity differs from the default 100", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "x" },
      { name: "core/image" },
      { kotlinskidevOverlayEnabled: true, kotlinskidevOverlayBackgroundOpacity: 40 }
    ) as { style?: Record<string, unknown> };

    expect(result.style).toEqual({ "--kt-overlay-bg-opacity": 0.4 });
  });

  it("omits --kt-overlay-bg-opacity when it is left at the default 100", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "x" },
      { name: "core/image" },
      {
        kotlinskidevOverlayEnabled: true,
        kotlinskidevOverlayBackgroundColor: "#123456",
        kotlinskidevOverlayBackgroundOpacity: 100,
      }
    ) as { style?: Record<string, unknown> };

    expect(result.style).toEqual({ "--kt-overlay-bg": "#123456" });
  });
});
