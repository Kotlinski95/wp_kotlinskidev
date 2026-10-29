import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { applyFilters } from "@wordpress/hooks";
import { hasBlockSupport } from "@wordpress/blocks";
import type { ComponentType } from "react";

jest.mock("@wordpress/blocks", () => ({
  hasBlockSupport: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("./TextShadowSwatches", () => ({
  TextShadowSwatches: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div>
      <span data-testid="current-value">{value}</span>
      <button onClick={() => onChange("var(--wp--custom--text-shadow--subtle)")}>
        pick-subtle
      </button>
    </div>
  ),
}));

import "./index";

describe("text-shadow-support — blocks.registerBlockType filter", () => {
  it("leaves settings unchanged for a block without shadow support", () => {
    const settings = { supports: {}, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the kotlinskidevTextShadow attribute for a block that supports shadow", () => {
    const settings = { supports: { shadow: true }, attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; kotlinskidevTextShadow: { type: string; default: string } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.kotlinskidevTextShadow).toEqual({ type: "string", default: "" });
  });
});

describe("text-shadow-support — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { kotlinskidevTextShadow?: string };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  afterEach(() => jest.clearAllMocks());

  it("renders only the original edit when the block has no shadow support", () => {
    (hasBlockSupport as jest.Mock).mockReturnValue(false);

    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Text Shadow")).not.toBeInTheDocument();
  });

  it("renders the shadow controls with the current value for a supported block", () => {
    (hasBlockSupport as jest.Mock).mockReturnValue(true);

    renderWrapped({
      name: "core/paragraph",
      attributes: { kotlinskidevTextShadow: "var(--wp--custom--text-shadow--subtle)" },
      setAttributes: jest.fn(),
    });
    fireEvent.click(screen.getByRole("button", { name: /Text Shadow/ }));

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByTestId("current-value")).toHaveTextContent(
      "var(--wp--custom--text-shadow--subtle)"
    );
  });

  it("calls setAttributes with the picked shadow value", () => {
    (hasBlockSupport as jest.Mock).mockReturnValue(true);
    const setAttributes = jest.fn();

    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes });
    fireEvent.click(screen.getByRole("button", { name: /Text Shadow/ }));
    fireEvent.click(screen.getByRole("button", { name: "pick-subtle" }));

    expect(setAttributes).toHaveBeenCalledWith({
      kotlinskidevTextShadow: "var(--wp--custom--text-shadow--subtle)",
    });
  });
});

describe("text-shadow-support — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: Record<string, unknown>;
    wrapperProps?: Record<string, unknown>;
  }

  function OriginalBlockListBlock(props: Props) {
    return <div data-testid="block-list-block" data-style={JSON.stringify(props.wrapperProps)} />;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("leaves wrapperProps untouched when there is no text shadow", () => {
    renderWrapped({ attributes: {}, wrapperProps: { className: "existing" } });

    const data = JSON.parse(
      screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}"
    );
    expect(data).toEqual({ className: "existing" });
  });

  it("merges the text-shadow style into existing wrapperProps", () => {
    renderWrapped({
      attributes: { kotlinskidevTextShadow: "0 0 4px black" },
      wrapperProps: { className: "existing", style: { color: "red" } },
    });

    const data = JSON.parse(
      screen.getByTestId("block-list-block").getAttribute("data-style") ?? "{}"
    );
    expect(data).toEqual({
      className: "existing",
      style: { color: "red", textShadow: "0 0 4px black" },
    });
  });
});
