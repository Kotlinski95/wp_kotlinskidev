import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

interface CustomCssVarEntry {
  name: string;
  value: string;
}

afterEach(() => {
  delete window.kotlinskidevCssVarBlocks;
});

describe("custom-css-vars — blocks.registerBlockType filter", () => {
  it("adds the customCssVars attribute for a supported block", () => {
    const settings = { name: "kotlinskidev/icon", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; customCssVars: { type: string; default: unknown[] } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.customCssVars).toEqual({ type: "array", default: [] });
  });

  it("adds the attribute for core/image, one of the other default-supported blocks", () => {
    const settings = { name: "core/image", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { customCssVars?: unknown };
    };

    expect(result.attributes.customCssVars).toBeDefined();
  });

  it("adds the attribute for core/site-logo, so a header logo can be recoloured via var()", () => {
    const settings = { name: "core/site-logo", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { customCssVars?: unknown };
    };

    expect(result.attributes.customCssVars).toBeDefined();
  });

  it("leaves an unsupported block's settings untouched", () => {
    const settings = { name: "core/paragraph", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; customCssVars?: unknown };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.customCssVars).toBeUndefined();
  });

  it("respects a custom window.kotlinskidevCssVarBlocks list over the built-in default", () => {
    window.kotlinskidevCssVarBlocks = ["core/cover"];
    const settings = { name: "core/cover", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { customCssVars?: unknown };
    };

    expect(result.attributes.customCssVars).toBeDefined();
  });
});

describe("custom-css-vars — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: { customCssVars?: CustomCssVarEntry[] };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("does not render the panel for an unsupported block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Custom CSS Variables" })).not.toBeInTheDocument();
  });

  it("renders the collapsed panel for a supported block", () => {
    renderWrapped({ name: "kotlinskidev/icon", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByRole("button", { name: "Custom CSS Variables" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("adds a new empty row when Add Variable is clicked", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "kotlinskidev/icon", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: "Custom CSS Variables" }));
    await user.click(screen.getByRole("button", { name: "Add Variable" }));

    expect(setAttributes).toHaveBeenCalledWith({ customCssVars: [{ name: "", value: "" }] });
  });

  it("updates only the name of the changed row, preserving other rows", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "kotlinskidev/icon",
      attributes: {
        customCssVars: [
          { name: "--logo-icon-bg", value: "#1c1d18" },
          { name: "--logo-icon-mark", value: "#00f6ff" },
        ],
      },
      setAttributes,
    });
    await user.click(screen.getByRole("button", { name: "Custom CSS Variables" }));

    const nameInputs = screen.getAllByLabelText("Name");
    fireEvent.change(nameInputs[1], { target: { value: "--logo-divider" } });

    expect(setAttributes).toHaveBeenCalledWith({
      customCssVars: [
        { name: "--logo-icon-bg", value: "#1c1d18" },
        { name: "--logo-divider", value: "#00f6ff" },
      ],
    });
  });

  it("updates only the value of the changed row, preserving other rows", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "kotlinskidev/icon",
      attributes: {
        customCssVars: [{ name: "--logo-icon-bg", value: "#1c1d18" }],
      },
      setAttributes,
    });
    await user.click(screen.getByRole("button", { name: "Custom CSS Variables" }));

    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "#000000" } });

    expect(setAttributes).toHaveBeenCalledWith({
      customCssVars: [{ name: "--logo-icon-bg", value: "#000000" }],
    });
  });

  it("removes only the targeted row when its remove button is clicked", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "kotlinskidev/icon",
      attributes: {
        customCssVars: [
          { name: "--logo-icon-bg", value: "#1c1d18" },
          { name: "--logo-icon-mark", value: "#00f6ff" },
        ],
      },
      setAttributes,
    });
    await user.click(screen.getByRole("button", { name: "Custom CSS Variables" }));

    await user.click(screen.getAllByRole("button", { name: "Remove variable" })[0]);

    expect(setAttributes).toHaveBeenCalledWith({
      customCssVars: [{ name: "--logo-icon-mark", value: "#00f6ff" }],
    });
  });
});

describe("custom-css-vars — editor.BlockListBlock filter", () => {
  interface Props {
    name?: string;
    attributes?: { customCssVars?: CustomCssVarEntry[] };
    wrapperProps?: Record<string, unknown>;
  }

  function OriginalBlockListBlock(props: Props) {
    return (
      <div
        data-testid="block-list-block"
        data-style={JSON.stringify(props.wrapperProps?.style ?? {})}
      />
    );
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("leaves an unsupported block unchanged even with customCssVars present", () => {
    renderWrapped({
      name: "core/paragraph",
      attributes: { customCssVars: [{ name: "--logo-icon-bg", value: "#1c1d18" }] },
    });

    expect(within(screen.getByTestId("block-list-block")).getByText).toBeDefined();
    expect(
      JSON.parse(screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}")
    ).toEqual({});
  });

  it("leaves the block unchanged when there are no entries", () => {
    renderWrapped({ name: "kotlinskidev/icon", attributes: { customCssVars: [] } });

    expect(
      JSON.parse(screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}")
    ).toEqual({});
  });

  it("applies valid entries as inline custom properties for a supported block", () => {
    renderWrapped({
      name: "kotlinskidev/icon",
      attributes: {
        customCssVars: [
          { name: "--logo-icon-bg", value: "#1c1d18" },
          { name: "--logo-icon-mark", value: "#00f6ff" },
        ],
      },
    });

    expect(
      JSON.parse(screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}")
    ).toEqual({
      "--logo-icon-bg": "#1c1d18",
      "--logo-icon-mark": "#00f6ff",
    });
  });

  it("skips a row with an invalid name or empty value while keeping a valid sibling", () => {
    renderWrapped({
      name: "kotlinskidev/icon",
      attributes: {
        customCssVars: [
          { name: "not-a-var", value: "#1c1d18" },
          { name: "--logo-icon-mark", value: "" },
          { name: "--logo-divider", value: "#00f6ff" },
        ],
      },
    });

    expect(
      JSON.parse(screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}")
    ).toEqual({ "--logo-divider": "#00f6ff" });
  });
});
