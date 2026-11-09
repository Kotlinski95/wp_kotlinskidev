import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

let mockBlocks: unknown[] = [];

jest.mock("@wordpress/block-editor", () => ({
  InspectorAdvancedControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@wordpress/components", () => ({
  ToggleControl: ({
    label,
    help,
    checked,
    onChange,
  }: {
    label: string;
    help: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div>
      <input
        id="mock-toggle"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor="mock-toggle">{label}</label>
      <span>{help}</span>
    </div>
  ),
  Notice: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
}));

jest.mock("@wordpress/data", () => ({
  useSelect: (mapper: (select: (store: string) => unknown) => unknown) =>
    mapper(() => ({ getBlocks: () => mockBlocks })),
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
    expect(screen.queryByText("Above the fold")).not.toBeInTheDocument();
  });

  it("renders the above-fold toggle for a deferrable block, reflecting its current value", () => {
    setDeferrableBlocks({ "kotlinskidev/hero-carousel": false });

    renderWrapped({
      name: "kotlinskidev/hero-carousel",
      attributes: { kotlinskidevAboveFold: true },
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Above the fold/ })).toBeChecked();
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
    await user.click(screen.getByRole("checkbox", { name: /Above the fold/ }));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevAboveFold: true });
  });
});

describe("above-fold — legacy migration", () => {
  it("maps kotlinskidevSkipLazy true to kotlinskidevAboveFold and drops the old key", () => {
    const result = applyFilters("blocks.getBlockAttributes", {
      url: "a.webp",
      kotlinskidevSkipLazy: true,
    });

    expect(result).toEqual({ url: "a.webp", kotlinskidevAboveFold: true });
  });

  it("drops a false kotlinskidevSkipLazy without setting the new key", () => {
    const result = applyFilters("blocks.getBlockAttributes", { kotlinskidevSkipLazy: false });

    expect(result).toEqual({});
  });

  it("leaves attributes without the old key untouched", () => {
    const attributes = { url: "a.webp" };

    expect(applyFilters("blocks.getBlockAttributes", attributes)).toBe(attributes);
  });
});

describe("above-fold — multiple flagged warning", () => {
  afterEach(() => {
    mockBlocks = [];
    delete (window as unknown as { kotlinskidevDeferrableBlocks?: unknown })
      .kotlinskidevDeferrableBlocks;
  });

  function renderCover() {
    const Wrapped = applyFilters("editor.BlockEdit", () => null) as ComponentType<
      Record<string, unknown>
    >;
    return render(<Wrapped name="core/cover" attributes={{}} setAttributes={jest.fn()} />);
  }

  it("applies to core media blocks even when the registry lacks them", () => {
    setDeferrableBlocks({});

    renderCover();

    expect(screen.getByRole("checkbox", { name: /Above the fold/ })).toBeInTheDocument();
  });

  it("shows no warning for a single flagged element", () => {
    mockBlocks = [{ name: "core/cover", attributes: { kotlinskidevAboveFold: true } }];

    renderCover();

    expect(screen.queryByText(/marked above the fold/)).not.toBeInTheDocument();
  });

  it("warns when more than one registry block is flagged, including nested ones", () => {
    mockBlocks = [
      { name: "core/cover", attributes: { kotlinskidevAboveFold: true } },
      {
        name: "core/group",
        attributes: { kotlinskidevAboveFold: true },
        innerBlocks: [
          { name: "kotlinskidev/hero-carousel", attributes: { kotlinskidevAboveFold: true } },
        ],
      },
    ];

    renderCover();

    expect(
      screen.getByText(
        "2 elements on this page are marked above the fold. Only the first gets high priority."
      )
    ).toBeInTheDocument();
  });
});
