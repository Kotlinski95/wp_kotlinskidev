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

  it("adds the extra-effects and opacity attributes for a supported block", () => {
    const settings = { name: "core/group", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        hoverAnimationExtra: { type: string; default: string[] };
        hoverOpacityEnabled: { type: string; default: boolean };
        hoverOpacityFrom: { type: string; default: number };
        hoverOpacityTo: { type: string; default: number };
      };
    };

    expect(result.attributes.hoverAnimationExtra).toEqual({
      type: "array",
      default: [],
      items: { type: "string" },
    });
    expect(result.attributes.hoverOpacityEnabled).toEqual({ type: "boolean", default: false });
    expect(result.attributes.hoverOpacityFrom).toEqual({ type: "number", default: 100 });
    expect(result.attributes.hoverOpacityTo).toEqual({ type: "number", default: 50 });
  });

  it("adds the hoverBorderColor attribute for a supported block", () => {
    const settings = { name: "core/group", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { hoverBorderColor: { type: string; default: string } };
    };

    expect(result.attributes.hoverBorderColor).toEqual({ type: "string", default: "" });
  });

  it("adds the hoverAnimation attribute for a dynamic server-rendered block too", () => {
    const settings = { name: "kotlinskidev/certificate", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { hoverAnimation: { type: string; default: string } };
    };

    expect(result.attributes.hoverAnimation).toEqual({ type: "string", default: "" });
  });

  it("leaves other ServerSideRender-based dynamic blocks excluded, since their block.json REST schema doesn't know these attributes", () => {
    const settings = { name: "kotlinskidev/article-card", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("does nothing when the block settings have no attributes object at all", () => {
    const settings = { name: "core/group" };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes?: unknown;
    };

    expect(result.attributes).toBeUndefined();
  });

  it("adds the hoverEnhancedGlow attribute for core/button", () => {
    const result = applyFilters("blocks.registerBlockType", {
      name: "core/button",
      attributes: {},
    }) as { attributes: { hoverEnhancedGlow: { type: string; default: boolean } } };

    expect(result.attributes.hoverEnhancedGlow).toEqual({ type: "boolean", default: false });
  });

  it("adds the hoverEnhancedGlow attribute for a plain block like core/group too", () => {
    const result = applyFilters("blocks.registerBlockType", {
      name: "core/group",
      attributes: {},
    }) as { attributes: { hoverEnhancedGlow: { type: string; default: boolean } } };

    expect(result.attributes.hoverEnhancedGlow).toEqual({ type: "boolean", default: false });
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
    expect(screen.queryByText("Hover Effects")).not.toBeInTheDocument();
  });

  it("shows the animation select for a supported block once expanded", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));

    expect(screen.getByRole("combobox", { name: "Animation Type" })).toHaveValue("");
  });

  it("updates hoverAnimation when a new animation is selected", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Type" }),
      "hover-jump"
    );

    expect(setAttributes).toHaveBeenCalledWith({ hoverAnimation: "hover-jump" });
  });

  it("hides the primary animation from the additional-effects checkbox list", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { hoverAnimation: "hover-jump" },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));

    expect(screen.queryByRole("checkbox", { name: "Jump" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Scale" })).toBeInTheDocument();
  });

  it("adds a checked effect to hoverAnimationExtra", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));
    await user.click(screen.getByRole("checkbox", { name: "Scale" }));

    expect(setAttributes).toHaveBeenCalledWith({ hoverAnimationExtra: ["hover-scale"] });
  });

  it("removes an unchecked effect from hoverAnimationExtra", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { hoverAnimationExtra: ["hover-scale", "hover-rotate"] },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));
    await user.click(screen.getByRole("checkbox", { name: "Scale" }));

    expect(setAttributes).toHaveBeenCalledWith({ hoverAnimationExtra: ["hover-rotate"] });
  });

  it("hides the opacity range controls until the opacity toggle is on", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));

    expect(screen.queryByRole("slider", { name: "Starting opacity" })).not.toBeInTheDocument();
  });

  it("shows the opacity range controls once the opacity toggle is on", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { hoverOpacityEnabled: true, hoverOpacityFrom: 100, hoverOpacityTo: 30 },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));

    expect(screen.getByRole("slider", { name: "Starting opacity" })).toHaveValue("100");
    expect(screen.getByRole("slider", { name: "Opacity on hover" })).toHaveValue("30");
  });

  it("enables the opacity effect via the toggle", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));
    await user.click(screen.getByRole("checkbox", { name: "Fade opacity on hover" }));

    expect(setAttributes).toHaveBeenCalledWith({ hoverOpacityEnabled: true });
  });

  it("does not show the Cursor glow toggle for kotlinskidev/button, which has its own dedicated panel", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "kotlinskidev/button", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));

    expect(screen.queryByRole("checkbox", { name: /cursor glow/i })).not.toBeInTheDocument();
  });

  it("shows the Cursor glow toggle for core/button and wires it to hoverEnhancedGlow", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/button", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));
    await user.click(screen.getByRole("checkbox", { name: /cursor glow/i }));

    expect(setAttributes).toHaveBeenCalledWith({ hoverEnhancedGlow: true });
  });

  it("shows the Cursor glow toggle for a plain block like core/paragraph too", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Hover Effects/ }));
    await user.click(screen.getByRole("checkbox", { name: /cursor glow/i }));

    expect(setAttributes).toHaveBeenCalledWith({ hoverEnhancedGlow: true });
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

  it("adds the color-transition and bg-color classes and CSS custom property when only a hover background color is set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "", hoverBackgroundColor: "#8209d3", hoverTextColor: "" }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe("has-hover-color-transition has-hover-bg-color");
    expect(result.style).toEqual({ "--hover-bg-color": "#8209d3" });
  });

  it("does not add the text-color class or CSS custom property when only a hover background color is set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "", hoverBackgroundColor: "#8209d3", hoverTextColor: "" }
    ) as { className: string; style?: Record<string, string> };

    expect(result.className).not.toContain("has-hover-text-color");
    expect(result.style?.["--hover-text-color"]).toBeUndefined();
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

    expect(result.className).toBe("has-hover-color-transition has-hover-bg-color");
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

  it("adds the text-gradient class and passes a gradient text value straight through as the CSS custom property", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        hoverAnimation: "",
        hoverBackgroundColor: "",
        hoverTextColor: "linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)",
      }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe(
      "has-hover-color-transition has-hover-text-color has-hover-text-gradient"
    );
    expect(result.style).toEqual({
      "--hover-text-color": "linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)",
    });
  });

  it("combines the animation class with the color-transition and text-color classes", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { hoverAnimation: "hover-jump", hoverBackgroundColor: "", hoverTextColor: "#ffffff" }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe(
      "existing hover-jump has-hover-color-transition has-hover-text-color"
    );
    expect(result.style).toEqual({ "--hover-text-color": "#ffffff" });
  });

  it("does not add the bg-color class or CSS custom property when only a hover text color is set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "", hoverBackgroundColor: "", hoverTextColor: "#ffffff" }
    ) as { className: string; style?: Record<string, string> };

    expect(result.className).not.toContain("has-hover-bg-color");
    expect(result.style?.["--hover-bg-color"]).toBeUndefined();
  });

  it("adds the border class and CSS custom property when a hover border color is set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverBorderColor: "#8209d3" }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe("has-hover-border");
    expect(result.style).toEqual({ "--hover-border-color": "#8209d3" });
  });

  it("leaves the border class untouched when no hover border color is set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { hoverBorderColor: "" }
    ) as { className: string };

    expect(result.className).toBe("existing");
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

  it("appends additional effect classes alongside the primary animation", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { hoverAnimation: "hover-jump", hoverAnimationExtra: ["hover-scale", "hover-rotate"] }
    ) as { className: string };

    expect(result.className).toBe("existing hover-jump hover-scale hover-rotate");
  });

  it("does not duplicate a value repeated between the primary animation and extras", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverAnimation: "hover-jump", hoverAnimationExtra: ["hover-jump"] }
    ) as { className: string };

    expect(result.className).toBe("hover-jump");
  });

  it("adds the opacity class and normalized 0-1 CSS variables when opacity is enabled", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverOpacityEnabled: true, hoverOpacityFrom: 100, hoverOpacityTo: 25 }
    ) as { className: string; style: Record<string, number> };

    expect(result.className).toBe("has-hover-opacity");
    expect(result.style).toEqual({ "--hover-opacity-from": 1, "--hover-opacity-to": 0.25 });
  });

  it("leaves opacity untouched when the opacity toggle is off", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverOpacityEnabled: false, hoverOpacityFrom: 100, hoverOpacityTo: 25 }
    ) as { className: string; style?: Record<string, number> };

    expect(result.className).toBeUndefined();
    expect(result.style).toBeUndefined();
  });

  it("combines an animation, additional effects, and opacity all together", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        hoverAnimation: "hover-jump",
        hoverAnimationExtra: ["hover-scale"],
        hoverOpacityEnabled: true,
        hoverOpacityFrom: 100,
        hoverOpacityTo: 50,
      }
    ) as { className: string; style: Record<string, number> };

    expect(result.className).toBe("hover-jump hover-scale has-hover-opacity");
    expect(result.style).toEqual({ "--hover-opacity-from": 1, "--hover-opacity-to": 0.5 });
  });

  it("adds the has-enhanced-hover-glow class when hoverEnhancedGlow is set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverEnhancedGlow: true }
    ) as { className: string };

    expect(result.className).toBe("has-enhanced-hover-glow");
  });

  it("does not add the has-enhanced-hover-glow class when hoverEnhancedGlow is off", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { hoverEnhancedGlow: false }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("suppresses has-hover-text-color when hoverEnhancedGlow is also set, but still sets the CSS custom properties for the glow to read", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { hoverTextColor: "#ffffff", hoverEnhancedGlow: true }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe("has-hover-color-transition has-enhanced-hover-glow");
    expect(result.style).toEqual({
      "--hover-text-color": "#ffffff",
      "--hover-text-spotlight-color": "#ffffff",
    });
  });

  it("does not set --hover-text-spotlight-color when the hover text color is a gradient, since embedding a gradient string as a radial-gradient color-stop is invalid CSS", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        hoverTextColor: "linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)",
        hoverEnhancedGlow: true,
      }
    ) as { className: string; style: Record<string, string> };

    expect(result.className).toBe(
      "has-hover-color-transition has-hover-text-gradient has-enhanced-hover-glow"
    );
    expect(result.style).toEqual({
      "--hover-text-color": "linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)",
    });
  });

  it("still adds has-hover-text-gradient when hoverEnhancedGlow is set with a gradient hover text color, since hover-glow.scss needs it to pick its gradient-safe background-image branch", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        hoverTextColor: "linear-gradient(135deg,#8209d3 0%,#ff6b6b 100%)",
        hoverEnhancedGlow: true,
      }
    ) as { className: string };

    expect(result.className).toBe(
      "has-hover-color-transition has-hover-text-gradient has-enhanced-hover-glow"
    );
  });
});
