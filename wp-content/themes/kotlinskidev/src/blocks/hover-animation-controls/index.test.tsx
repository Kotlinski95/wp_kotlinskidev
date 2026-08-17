import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  __experimentalColorGradientControl: ({ label }: { label: string }) => <div>{label}</div>,
}));

import "./index";

describe("hover-animation-controls — blocks.registerBlockType filter", () => {
  it("leaves excluded blocks untouched", () => {
    const settings = { name: "core/html", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the hoverAnimation attribute for a supported block with an attributes object", () => {
    const settings = { name: "core/group", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; hoverAnimation: { type: string; default: string } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.hoverAnimation).toEqual({ type: "string", default: "" });
  });

  it("does nothing when the block settings have no attributes object at all", () => {
    const settings = { name: "core/group" };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes?: unknown;
    };

    expect(result.attributes).toBeUndefined();
  });
});

describe("hover-animation-controls — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { hoverAnimation?: string };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders only the original edit for an excluded block", () => {
    renderWrapped({ name: "core/code", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Hover Animations")).not.toBeInTheDocument();
  });

  it("shows the animation select for a supported block once expanded", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Hover Animations/ }));

    expect(screen.getByRole("combobox", { name: "Animation Type" })).toHaveValue("");
  });

  it("updates hoverAnimation when a new animation is selected", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Hover Animations/ }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Type" }),
      "hover-jump"
    );

    expect(setAttributes).toHaveBeenCalledWith({ hoverAnimation: "hover-jump" });
  });
});

describe("hover-animation-controls — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when there is no hover animation", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      {},
      { hoverAnimation: "" }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("sets the class directly when there was no existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "hover-jump" }
    ) as { className: string };

    expect(result.className).toBe("hover-jump");
  });

  it("appends the animation class to an existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { hoverAnimation: "hover-jump" }
    ) as { className: string };

    expect(result.className).toBe("existing hover-jump");
  });

  it("adds the color-transition class and CSS custom properties when a hover color is set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "", hoverBackgroundColor: "#8209d3", hoverTextColor: "" }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe("has-hover-color-transition");
    expect(result.style).toEqual({ "--hover-bg-color": "#8209d3" });
  });

  it("passes a gradient background value straight through as the CSS custom property", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        hoverAnimation: "",
        hoverBackgroundColor: "linear-gradient(135deg,rgba(255,255,255,0.1) 0%,#8209d3 100%)",
        hoverTextColor: "",
      }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe("has-hover-color-transition");
    expect(result.style).toEqual({
      "--hover-bg-color": "linear-gradient(135deg,rgba(255,255,255,0.1) 0%,#8209d3 100%)",
    });
  });

  it("passes an 8-digit hex (alpha) background value straight through as the CSS custom property", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "", hoverBackgroundColor: "#ffffff0a", hoverTextColor: "" }
    ) as { className: string; style: Record<string, string> };

    expect(result.style).toEqual({ "--hover-bg-color": "#ffffff0a" });
  });

  it("combines the animation class with the color-transition class", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { hoverAnimation: "hover-jump", hoverBackgroundColor: "", hoverTextColor: "#ffffff" }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe("existing hover-jump has-hover-color-transition");
    expect(result.style).toEqual({ "--hover-text-color": "#ffffff" });
  });

  it("passes the block's own border radius through for the zoom animation", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "hover-zoom-bg", style: { border: { radius: "12px" } } }
    ) as { style: Record<string, string> };

    expect(result.style).toEqual({ "--hover-zoom-radius": "12px" });
  });

  it("does not pass a border radius for animations other than zoom", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "hover-jump", style: { border: { radius: "12px" } } }
    ) as { style?: Record<string, string> };

    expect(result.style).toBeUndefined();
  });
});
