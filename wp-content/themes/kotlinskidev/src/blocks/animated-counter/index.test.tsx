import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("animated-counter — blocks.registerBlockType filter", () => {
  it("leaves an unsupported block unchanged", () => {
    const settings = { name: "core/quote", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the counter attributes with their defaults for a supported block", () => {
    const settings = { name: "core/heading", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, { type: string; default: unknown }>;
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.enableCounter).toEqual({ type: "boolean", default: false });
    expect(result.attributes.counterDuration).toEqual({ type: "string", default: "2000" });
    expect(result.attributes.counterCustomDuration).toEqual({ type: "number", default: 2000 });
    expect(result.attributes.counterEasing).toEqual({ type: "string", default: "easeOut" });
  });

  it("leaves a supported block unchanged when it has no attributes object", () => {
    const settings = { name: "core/paragraph" };

    const result = applyFilters("blocks.registerBlockType", settings) as { attributes?: unknown };

    expect(result.attributes).toBeUndefined();
  });
});

describe("animated-counter — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: {
      enableCounter?: boolean;
      counterDuration?: string;
      counterCustomDuration?: number;
      counterEasing?: string;
    };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Animated Counter/ }));
  }

  it("renders only the original edit for an unsupported block", () => {
    renderWrapped({ name: "core/quote", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Animated Counter")).not.toBeInTheDocument();
  });

  it("keeps the panel collapsed by default for a supported block", () => {
    renderWrapped({ name: "core/heading", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Enable Counter Animation" })
    ).not.toBeInTheDocument();
  });

  it("hides the duration/easing controls until the counter is enabled", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/heading", attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Enable Counter Animation" })).not.toBeChecked();
    expect(screen.queryByRole("combobox", { name: "Animation Duration" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Animation Easing" })).not.toBeInTheDocument();
  });

  it("enables the counter animation", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/heading", attributes: {}, setAttributes });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Enable Counter Animation" }));

    expect(setAttributes).toHaveBeenCalledWith({ enableCounter: true });
  });

  it("shows the duration and easing controls once the counter is enabled", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/heading",
      attributes: { enableCounter: true },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByText(/How it works/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Animation Duration" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Animation Easing" })).toBeInTheDocument();
  });

  it("hides the custom duration slider unless Custom duration is selected", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/heading",
      attributes: { enableCounter: true, counterDuration: "2000" },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.queryByRole("slider", { name: "Custom Duration (ms)" })).not.toBeInTheDocument();
  });

  it("shows and wires the custom duration slider when Custom duration is selected", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/heading",
      attributes: { enableCounter: true, counterDuration: "custom", counterCustomDuration: 3000 },
      setAttributes,
    });
    await openPanel(user);

    const slider = screen.getByRole("slider", { name: "Custom Duration (ms)" });
    expect(slider).toHaveValue("3000");

    fireEvent.change(slider, { target: { value: "3500" } });

    expect(setAttributes).toHaveBeenCalledWith({ counterCustomDuration: 3500 });
  });

  it("updates the animation duration", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/heading",
      attributes: { enableCounter: true },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Duration" }),
      "Slow (3s)"
    );

    expect(setAttributes).toHaveBeenCalledWith({ counterDuration: "3000" });
  });

  it("updates the animation easing", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/heading",
      attributes: { enableCounter: true },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(screen.getByRole("combobox", { name: "Animation Easing" }), "Bounce");

    expect(setAttributes).toHaveBeenCalledWith({ counterEasing: "bounce" });
  });
});

describe("animated-counter — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when the counter is disabled", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      {},
      { enableCounter: false }
    ) as { className: string };

    expect(result).toBe(extraProps);
    expect(result.className).toBe("existing");
  });

  it("appends the animated-counter class and default data attributes", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { enableCounter: true }
    ) as { className: string; "data-counter-duration": number; "data-counter-easing": string };

    expect(result.className).toBe("existing animated-counter");
    expect(result["data-counter-duration"]).toBe(2000);
    expect(result["data-counter-easing"]).toBe("easeOut");
  });

  it("sets the class from scratch when there was no existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { enableCounter: true }
    ) as { className: string };

    expect(result.className).toBe("animated-counter");
  });

  it("uses counterDuration directly when it is not custom", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { enableCounter: true, counterDuration: "3000", counterEasing: "linear" }
    ) as { "data-counter-duration": string; "data-counter-easing": string };

    expect(result["data-counter-duration"]).toBe("3000");
    expect(result["data-counter-easing"]).toBe("linear");
  });

  it("uses counterCustomDuration when counterDuration is custom", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { enableCounter: true, counterDuration: "custom", counterCustomDuration: 7000 }
    ) as { "data-counter-duration": number };

    expect(result["data-counter-duration"]).toBe(7000);
  });
});
