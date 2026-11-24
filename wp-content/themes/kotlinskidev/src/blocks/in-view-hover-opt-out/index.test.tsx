import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

const saveProps = (name: string, attributes: Record<string, unknown>) =>
  applyFilters(
    "blocks.getSaveContent.extraProps",
    { className: "wp-block-group" },
    { name },
    attributes
  ) as { className: string };

describe("in-view-hover-opt-out — registration", () => {
  it.each(["core/group", "core/columns", "core/column", "core/cover"])(
    "adds an off-by-default attribute to %s",
    (name) => {
      const result = applyFilters("blocks.registerBlockType", { name, attributes: {} }) as {
        attributes: Record<string, unknown>;
      };

      expect(result.attributes.kotlinskidevInViewHoverOptOut).toEqual({
        type: "boolean",
        default: false,
      });
    }
  );

  it("leaves other blocks untouched", () => {
    const result = applyFilters("blocks.registerBlockType", {
      name: "core/paragraph",
      attributes: {},
    }) as { attributes: Record<string, unknown> };

    expect(result.attributes).toEqual({});
  });
});

describe("in-view-hover-opt-out — saved class", () => {
  it("leaves saved markup unchanged while off", () => {
    expect(saveProps("core/group", {}).className).toBe("wp-block-group");
    expect(saveProps("core/group", { kotlinskidevInViewHoverOptOut: false }).className).toBe(
      "wp-block-group"
    );
  });

  it("adds kt-in-view-hover-off when on", () => {
    expect(saveProps("core/group", { kotlinskidevInViewHoverOptOut: true }).className).toBe(
      "wp-block-group kt-in-view-hover-off"
    );
  });

  it("ignores unsupported blocks", () => {
    expect(saveProps("core/paragraph", { kotlinskidevInViewHoverOptOut: true }).className).toBe(
      "wp-block-group"
    );
  });
});

describe("in-view-hover-opt-out — editor panel", () => {
  const Wrapped = applyFilters("editor.BlockEdit", () => <div />) as ComponentType<
    Record<string, unknown>
  >;

  it("toggles the attribute from the inspector", () => {
    const setAttributes = jest.fn();
    render(<Wrapped name="core/group" attributes={{}} setAttributes={setAttributes} />);
    fireEvent.click(screen.getByRole("button", { name: /Touch-screen centred hover/ }));
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Exclude inner blocks from touch-screen centred hover",
      })
    );

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevInViewHoverOptOut: true });
  });

  it("renders no panel for unsupported blocks", () => {
    render(<Wrapped name="core/paragraph" attributes={{}} setAttributes={jest.fn()} />);

    expect(screen.queryByText("Touch-screen centred hover")).not.toBeInTheDocument();
  });
});
