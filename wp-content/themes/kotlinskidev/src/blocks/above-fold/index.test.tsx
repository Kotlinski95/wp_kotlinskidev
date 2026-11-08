import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorAdvancedControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

function setDeferrableBlocks(blocks: Record<string, boolean>) {
  (window as unknown as { kotlinskidevDeferrableBlocks?: unknown }).kotlinskidevDeferrableBlocks = {
    blocks,
  };
}

describe("above-fold — blocks.registerBlockType filter", () => {
  afterEach(() => {
    delete (window as unknown as { kotlinskidevDeferrableBlocks?: unknown })
      .kotlinskidevDeferrableBlocks;
  });

  it("leaves settings unchanged for a non-deferrable block", () => {
    setDeferrableBlocks({});
    const settings = { name: "core/paragraph", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as typeof settings;

    expect(result).toBe(settings);
  });

  it("adds the kotlinskidevAboveFold attribute for a deferrable block", () => {
    setDeferrableBlocks({ "kotlinskidev/hero-carousel": true });
    const settings = { name: "kotlinskidev/hero-carousel", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { kotlinskidevAboveFold: { type: string; default: boolean } };
    };

    expect(result.attributes.kotlinskidevAboveFold).toEqual({ type: "boolean", default: true });
  });

  it("defaults to false when the registry has no explicit default for the block", () => {
    setDeferrableBlocks({ "kotlinskidev/hero-carousel": undefined as unknown as boolean });
    const settings = { name: "kotlinskidev/hero-carousel", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { kotlinskidevAboveFold: { default: boolean } };
    };

    expect(result.attributes.kotlinskidevAboveFold.default).toBe(false);
  });
});

describe("above-fold — editor.BlockEdit filter", () => {
  afterEach(() => {
    delete (window as unknown as { kotlinskidevDeferrableBlocks?: unknown })
      .kotlinskidevDeferrableBlocks;
  });

  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { kotlinskidevAboveFold?: boolean };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders only the original edit for a non-deferrable block", () => {
    setDeferrableBlocks({});

    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Load above the fold")).not.toBeInTheDocument();
  });

  it("renders the above-fold toggle for a deferrable block, reflecting its current value", () => {
    setDeferrableBlocks({ "kotlinskidev/hero-carousel": false });

    renderWrapped({
      name: "kotlinskidev/hero-carousel",
      attributes: { kotlinskidevAboveFold: true },
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Load above the fold/ })).toBeChecked();
  });

  it("calls setAttributes with the new value when the toggle is clicked", async () => {
    setDeferrableBlocks({ "kotlinskidev/hero-carousel": false });
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    renderWrapped({
      name: "kotlinskidev/hero-carousel",
      attributes: { kotlinskidevAboveFold: false },
      setAttributes,
    });
    await user.click(screen.getByRole("checkbox", { name: /Load above the fold/ }));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevAboveFold: true });
  });
});
