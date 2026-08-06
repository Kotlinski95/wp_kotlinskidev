import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("scroll-animations — blocks.registerBlockType filter", () => {
  it("leaves excluded blocks untouched", () => {
    const settings = { name: "core/preformatted", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the three scroll-animation attributes for a supported block", () => {
    const settings = { name: "core/group", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, { type: string; default: string }>;
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.scrollAnimation).toEqual({ type: "string", default: "" });
    expect(result.attributes.scrollAnimationDelay).toEqual({ type: "string", default: "" });
    expect(result.attributes.scrollAnimationTranslate).toEqual({ type: "string", default: "" });
  });

  it("does nothing when the block settings have no attributes object", () => {
    const settings = { name: "core/group" };

    const result = applyFilters("blocks.registerBlockType", settings) as { attributes?: unknown };

    expect(result.attributes).toBeUndefined();
  });
});

describe("scroll-animations — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: {
      scrollAnimation?: string;
      scrollAnimationDelay?: string;
      scrollAnimationTranslate?: string;
    };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Scroll Animations/ }));
  }

  it("renders only the original edit for an excluded block", () => {
    renderWrapped({ name: "core/code", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Scroll Animations")).not.toBeInTheDocument();
  });

  it("does not show the distance control until an animation is chosen", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("combobox", { name: "Animation Type" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Animation Delay" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Animation Distance" })).not.toBeInTheDocument();
  });

  it("shows the distance control once a non-flip animation is set", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { scrollAnimation: "fade-in-on-scroll" },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("combobox", { name: "Animation Distance" })).toBeInTheDocument();
  });

  it("hides the distance control for flip animations", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { scrollAnimation: "flip-up-on-scroll" },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.queryByRole("combobox", { name: "Animation Distance" })).not.toBeInTheDocument();
  });

  it("updates the animation type", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });
    await openPanel(user);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Type" }),
      "fade-up-on-scroll"
    );

    expect(setAttributes).toHaveBeenCalledWith({ scrollAnimation: "fade-up-on-scroll" });
  });

  it("updates the animation delay", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });
    await openPanel(user);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Delay" }),
      "delay-300"
    );

    expect(setAttributes).toHaveBeenCalledWith({ scrollAnimationDelay: "delay-300" });
  });

  it("updates the animation distance", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { scrollAnimation: "fade-in-on-scroll" },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Distance" }),
      "translate-lg"
    );

    expect(setAttributes).toHaveBeenCalledWith({ scrollAnimationTranslate: "translate-lg" });
  });
});

describe("scroll-animations — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when there is no animation configured", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters("blocks.getSaveContent.extraProps", extraProps, {}, {}) as {
      className: string;
    };

    expect(result.className).toBe("existing");
  });

  it("appends only the classes that are actually set", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { scrollAnimation: "fade-in-on-scroll" }
    ) as { className: string };

    expect(result.className).toBe("fade-in-on-scroll");
  });

  it("joins animation, delay, and distance classes together", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      {
        scrollAnimation: "fade-in-on-scroll",
        scrollAnimationDelay: "delay-300",
        scrollAnimationTranslate: "translate-lg",
      }
    ) as { className: string };

    expect(result.className).toBe("existing fade-in-on-scroll delay-300 translate-lg");
  });
});
