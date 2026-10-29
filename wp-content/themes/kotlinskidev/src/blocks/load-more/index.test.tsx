import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";
import { DEFAULT_LOAD_MORE, type LoadMoreAttribute } from "./types";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@wordpress/components", () => {
  const actual = jest.requireActual("@wordpress/components");
  return {
    ...actual,
    ColorPalette: ({ onChange }: { onChange: (value: string | undefined) => void }) => (
      <div>
        <button onClick={() => onChange("#8209d3")}>pick-color</button>
        <button onClick={() => onChange(undefined)}>clear-color</button>
      </div>
    ),
  };
});

import "./index";

describe("load-more — blocks.registerBlockType filter", () => {
  it("adds the loadMore attribute to core/group", () => {
    const settings = { name: "core/group", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        loadMore: { type: string; default: LoadMoreAttribute };
      };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.loadMore).toEqual({
      type: "object",
      default: DEFAULT_LOAD_MORE,
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
    attributes: { loadMore?: LoadMoreAttribute };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /^Load More$/ }));
  }

  it("renders the original edit and skips the panel for other blocks", () => {
    renderWrapped({ name: "core/columns", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Load More$/ })).not.toBeInTheDocument();
  });

  it("shows a single panel for core/group, unchecked by default and hides the count/label/style fields", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getAllByRole("button", { name: /Load More/ })).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "Enable Load More" })).not.toBeChecked();
    expect(
      screen.queryByRole("spinbutton", { name: "Items to show initially" })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Button position")).not.toBeInTheDocument();
  });

  it("reveals the count, label and style fields once enabled, in the same panel", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Enable Load More" })).toBeChecked();
    expect(screen.getByRole("spinbutton", { name: "Items to show initially" })).toHaveValue(6);
    expect(screen.getByLabelText("Button label")).toHaveValue("");
    expect(screen.getByLabelText("Button position")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Underline text" })).toBeInTheDocument();
  });

  it("toggles enabled on click, preserving the rest of the object", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Enable Load More" }));

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { ...DEFAULT_LOAD_MORE, enabled: true },
    });
  });

  it("updates the button label independently of the rest of the attribute", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true, initialCount: 3 } },
      setAttributes,
    });
    await openPanel(user);

    const labelField = screen.getByLabelText("Button label");
    await user.type(labelField, "More");

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { ...DEFAULT_LOAD_MORE, enabled: true, initialCount: 3, buttonLabel: "M" },
    });
  });

  it("updates buttonAlign from the style fields", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true } },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(screen.getByLabelText("Button position"), "center");

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { ...DEFAULT_LOAD_MORE, enabled: true, buttonAlign: "center" },
    });
  });

  it("updates textColor from the first color picker", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true } },
      setAttributes,
    });
    await openPanel(user);

    await user.click(screen.getAllByText("pick-color")[0]);

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { ...DEFAULT_LOAD_MORE, enabled: true, textColor: "#8209d3" },
    });
  });

  it("updates hoverBackgroundColor from its own color picker, independently of the base background", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true } },
      setAttributes,
    });
    await openPanel(user);

    const pickButtons = screen.getAllByText("pick-color");
    expect(pickButtons).toHaveLength(6);
    await user.click(pickButtons[4]);

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { ...DEFAULT_LOAD_MORE, enabled: true, hoverBackgroundColor: "#8209d3" },
    });
  });

  it("updates underline from the style fields", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true } },
      setAttributes,
    });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Underline text" }));

    expect(setAttributes).toHaveBeenCalledWith({
      loadMore: { ...DEFAULT_LOAD_MORE, enabled: true, underline: true },
    });
  });
});

describe("load-more — editor.BlockListBlock filter", () => {
  interface Props {
    name?: string;
    attributes?: { loadMore?: LoadMoreAttribute };
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
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("appends the load-more class for core/group when enabled", () => {
    renderWrapped({
      name: "core/group",
      attributes: { loadMore: { ...DEFAULT_LOAD_MORE, enabled: true } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing kt-has-load-more");
  });
});
