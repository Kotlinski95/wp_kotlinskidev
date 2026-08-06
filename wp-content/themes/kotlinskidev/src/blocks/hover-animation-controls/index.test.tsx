import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
});
