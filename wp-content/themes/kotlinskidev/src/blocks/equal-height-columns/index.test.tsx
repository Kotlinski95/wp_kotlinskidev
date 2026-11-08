import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("equal-height-columns — blocks.registerBlockType filter", () => {
  it("adds the equalHeightColumns attribute to core/columns", () => {
    const settings = { name: "core/columns", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; equalHeightColumns: { type: string; default: boolean } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.equalHeightColumns).toEqual({ type: "boolean", default: false });
  });

  it("adds the equalHeightColumns attribute to core/group", () => {
    const settings = { name: "core/group", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; equalHeightColumns: { type: string; default: boolean } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.equalHeightColumns).toEqual({ type: "boolean", default: false });
  });

  it("leaves other blocks untouched", () => {
    const settings = { name: "core/paragraph", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, unknown>;
    };

    expect(result.attributes).toEqual({ existing: {} });
  });
});

describe("equal-height-columns — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { equalHeightColumns?: boolean; layout?: { type?: string } };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Equal Height/ }));
  }

  it("renders the original edit and skips the panel for other blocks", () => {
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Equal Height/ })).not.toBeInTheDocument();
  });

  it("skips the panel for a core/group with a non-grid layout", () => {
    renderWrapped({
      name: "core/group",
      attributes: { layout: { type: "flex" } },
      setAttributes: jest.fn(),
    });

    expect(screen.queryByRole("button", { name: /Equal Height/ })).not.toBeInTheDocument();
  });

  it("shows the toggle for core/columns, unchecked by default", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/columns", attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Equal height columns" })).not.toBeChecked();
  });

  it("reflects an existing true value as checked", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/columns",
      attributes: { equalHeightColumns: true },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Equal height columns" })).toBeChecked();
  });

  it("toggles the attribute on click", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/columns", attributes: {}, setAttributes });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Equal height columns" }));

    expect(setAttributes).toHaveBeenCalledWith({ equalHeightColumns: true });
  });

  it("shows the grid-worded toggle for a core/group with a grid layout", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { layout: { type: "grid" } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Equal height grid items" })).not.toBeChecked();
  });

  it("toggles the attribute on click for a grid core/group", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { layout: { type: "grid" } },
      setAttributes,
    });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Equal height grid items" }));

    expect(setAttributes).toHaveBeenCalledWith({ equalHeightColumns: true });
  });
});

describe("equal-height-columns — editor.BlockListBlock filter", () => {
  interface Props {
    name?: string;
    attributes?: { equalHeightColumns?: boolean; layout?: { type?: string } };
    className?: string;
  }

  function OriginalBlockListBlock({ className }: Props) {
    return <div data-testid="block-list-block" className={className} />;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("adds no class when equalHeightColumns is false", () => {
    renderWrapped({ name: "core/columns", attributes: {}, className: "existing" });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("adds no class for other blocks even when true", () => {
    renderWrapped({
      name: "core/group",
      attributes: { equalHeightColumns: true },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("adds no class for a core/group with a non-grid layout even when true", () => {
    renderWrapped({
      name: "core/group",
      attributes: { equalHeightColumns: true, layout: { type: "flex" } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("appends the equal-height class for core/columns when true", () => {
    renderWrapped({
      name: "core/columns",
      attributes: { equalHeightColumns: true },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe(
      "existing kt-equal-height-columns"
    );
  });

  it("appends the equal-height class for a grid core/group when true", () => {
    renderWrapped({
      name: "core/group",
      attributes: { equalHeightColumns: true, layout: { type: "grid" } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe(
      "existing kt-equal-height-columns"
    );
  });
});

describe("equal-height-columns — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged for other blocks", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      { name: "core/group" },
      { equalHeightColumns: true }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("leaves extraProps unchanged when equalHeightColumns is false", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      { name: "core/columns" },
      { equalHeightColumns: false }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("appends the equal-height class to an existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      { name: "core/columns" },
      { equalHeightColumns: true }
    ) as { className: string };

    expect(result.className).toBe("existing kt-equal-height-columns");
  });

  it("sets className from scratch when extraProps had none", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      { name: "core/columns" },
      { equalHeightColumns: true }
    ) as { className: string };

    expect(result.className).toBe("kt-equal-height-columns");
  });

  it("leaves extraProps unchanged for a core/group with a non-grid layout", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      { name: "core/group" },
      { equalHeightColumns: true, layout: { type: "flex" } }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("appends the equal-height class for a grid core/group", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      { name: "core/group" },
      { equalHeightColumns: true, layout: { type: "grid" } }
    ) as { className: string };

    expect(result.className).toBe("existing kt-equal-height-columns");
  });
});
