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

describe("background-effects-controls — blocks.registerBlockType filter", () => {
  it("leaves excluded blocks untouched", () => {
    const settings = { name: "core/html", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the backgroundEffect attribute for a supported block with an attributes object", () => {
    const settings = { name: "core/group", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; backgroundEffect: { type: string; default: string } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.backgroundEffect).toEqual({ type: "string", default: "" });
  });

  it("adds the backgroundEffectColor1/2/3 attributes for a supported block", () => {
    const settings = { name: "core/group", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        backgroundEffectColor1: { type: string; default: string };
        backgroundEffectColor2: { type: string; default: string };
        backgroundEffectColor3: { type: string; default: string };
      };
    };

    expect(result.attributes.backgroundEffectColor1).toEqual({ type: "string", default: "" });
    expect(result.attributes.backgroundEffectColor2).toEqual({ type: "string", default: "" });
    expect(result.attributes.backgroundEffectColor3).toEqual({ type: "string", default: "" });
  });

  it("does nothing when the block settings have no attributes object at all", () => {
    const settings = { name: "core/group" };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes?: unknown;
    };

    expect(result.attributes).toBeUndefined();
  });
});

describe("background-effects-controls — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { backgroundEffect?: string };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders only the original edit for an excluded block", () => {
    renderWrapped({ name: "core/code", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Background Effects")).not.toBeInTheDocument();
  });

  it("shows the effect select for a supported block once expanded", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Background Effects/ }));

    expect(screen.getByRole("combobox", { name: "Effect" })).toHaveValue("");
  });

  it("updates backgroundEffect when a new effect is selected", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Background Effects/ }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Effect" }), "kt-bg-fx-aurora");

    expect(setAttributes).toHaveBeenCalledWith({ backgroundEffect: "kt-bg-fx-aurora" });
  });

  it("hides the color pickers until an effect is selected", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Background Effects/ }));

    expect(screen.queryByText("Effect color 1")).not.toBeInTheDocument();
  });

  it("shows the color pickers once an effect is selected", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { backgroundEffect: "kt-bg-fx-wave" },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Background Effects/ }));

    expect(screen.getByText("Effect color 1")).toBeInTheDocument();
    expect(screen.getByText("Effect color 2")).toBeInTheDocument();
    expect(screen.getByText("Effect color 3")).toBeInTheDocument();
  });
});

describe("background-effects-controls — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when there is no background effect", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      {},
      { backgroundEffect: "" }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("sets the class directly when there was no existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { backgroundEffect: "kt-bg-fx-wave" }
    ) as { className: string };

    expect(result.className).toBe("kt-bg-fx-wave");
  });

  it("appends the effect class to an existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { backgroundEffect: "kt-bg-fx-glow-border" }
    ) as { className: string };

    expect(result.className).toBe("existing kt-bg-fx-glow-border");
  });

  it("leaves style untouched when no colors are set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { backgroundEffect: "kt-bg-fx-wave", backgroundEffectColor1: "", backgroundEffectColor2: "" }
    ) as { style?: Record<string, string> };

    expect(result.style).toBeUndefined();
  });

  it("sets CSS custom properties for each configured effect color", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        backgroundEffect: "kt-bg-fx-aurora",
        backgroundEffectColor1: "#ff00cc",
        backgroundEffectColor2: "#00f0ff0a",
        backgroundEffectColor3: "",
      }
    ) as { style: Record<string, string> };

    expect(result.style).toEqual({
      "--kt-bg-fx-color-1": "#ff00cc",
      "--kt-bg-fx-color-2": "#00f0ff0a",
    });
  });

  it("does not set colors when no effect is selected", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { backgroundEffect: "", backgroundEffectColor1: "#ff00cc" }
    ) as { style?: Record<string, string> };

    expect(result.style).toBeUndefined();
  });

  it("passes the block's own native border width through for the glow-border effect", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        backgroundEffect: "kt-bg-fx-glow-border",
        backgroundEffectColor1: "#8209d3",
        style: { border: { width: "3px" } },
      }
    ) as { style: Record<string, string> };

    expect(result.style).toEqual({
      "--kt-bg-fx-color-1": "#8209d3",
      "--kt-bg-fx-border-width": "3px",
    });
  });

  it("does not pass a border width for effects other than glow-border", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        backgroundEffect: "kt-bg-fx-wave",
        backgroundEffectColor1: "#8209d3",
        style: { border: { width: "3px" } },
      }
    ) as { style: Record<string, string> };

    expect(result.style).toEqual({ "--kt-bg-fx-color-1": "#8209d3" });
  });
});
