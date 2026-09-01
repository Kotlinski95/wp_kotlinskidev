import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("load-more — blocks.registerBlockType filter", () => {
  it("adds the loadMore attribute to core/group", () => {
    const settings = { name: "core/group", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        loadMore: { type: string; default: { enabled: boolean; initialCount: number } };
      };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.loadMore).toEqual({
      type: "object",
      default: { enabled: false, initialCount: 6, buttonLabel: "" },
    });
  });

  it("leaves other blocks untouched", () => {
    const settings = { name: "core/columns", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, unknown>;
    };

    expect(result.attributes).toEqual({ existing: {} });
  });
});

describe("load-more — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { loadMore?: { enabled: boolean; initialCount: number; buttonLabel: string } };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Load More/ }));
  }

  it("renders the original edit and skips the panel for other blocks", () => {
    renderWrapped({ name: "core/columns", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Load More/ })).not.toBeInTheDocument();
  });

  it("shows the toggle for core/group, unchecked by default and hides the count/label fields", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Enable Load More" })).not.toBeChecked();
    expect(
      screen.queryByRole("spinbutton", { name: "Items to show initially" })
    ).not.toBeInTheDocument();
  });

  it("reveals the count and label fields once enabled", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { enabled: true, initialCount: 6, buttonLabel: "" } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Enable Load More" })).toBeChecked();
    expect(screen.getByRole("spinbutton", { name: "Items to show initially" })).toHaveValue(6);
    expect(screen.getByLabelText("Button label")).toHaveValue("");
  });

  it("toggles enabled on click, preserving the rest of the object", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Enable Load More" }));

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { enabled: true, initialCount: 6, buttonLabel: "" },
    });
  });

  it("updates the button label independently of initialCount", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { enabled: true, initialCount: 3, buttonLabel: "" } },
      setAttributes,
    });
    await openPanel(user);

    const labelField = screen.getByLabelText("Button label");
    await user.type(labelField, "More");

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { enabled: true, initialCount: 3, buttonLabel: "M" },
    });
  });
});

describe("load-more — editor.BlockListBlock filter", () => {
  interface Props {
    name?: string;
    attributes?: { loadMore?: { enabled: boolean; initialCount: number; buttonLabel: string } };
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

  it("adds no class when loadMore is disabled", () => {
    renderWrapped({ name: "core/group", attributes: {}, className: "existing" });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("adds no class for other blocks even when enabled", () => {
    renderWrapped({
      name: "core/columns",
      attributes: { loadMore: { enabled: true, initialCount: 6, buttonLabel: "" } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("appends the load-more class for core/group when enabled", () => {
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { enabled: true, initialCount: 6, buttonLabel: "" } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing kt-has-load-more");
  });
});
