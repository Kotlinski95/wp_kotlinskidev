import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import { createReduxStore, register } from "@wordpress/data";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorAdvancedControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface FakeBlock {
  innerBlocks: Array<{ name: string }>;
}

const mockBlocks: Record<string, FakeBlock | undefined> = {};

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    selectors: {
      getBlock: (_state: unknown, clientId: string) => mockBlocks[clientId],
    },
  })
);

import { faqLayoutClassName } from "./index";

describe("faqLayoutClassName", () => {
  it("returns an empty string when there is no layout config", () => {
    expect(faqLayoutClassName(undefined)).toBe("");
  });

  it("returns an empty string for the default layout", () => {
    expect(faqLayoutClassName({ layout: "default" })).toBe("");
  });

  it("defaults independent layout to 2 columns when none is set", () => {
    expect(faqLayoutClassName({ layout: "independent" })).toBe("kt-faq-independent-columns-2");
  });

  it("uses the configured column count", () => {
    expect(faqLayoutClassName({ layout: "independent", columns: 3 })).toBe(
      "kt-faq-independent-columns-3"
    );
  });

  it("falls back to 2 columns for an out-of-range value", () => {
    expect(faqLayoutClassName({ layout: "independent", columns: 5 as never })).toBe(
      "kt-faq-independent-columns-2"
    );
  });
});

describe("faq-layout — blocks.registerBlockType filter", () => {
  it("leaves non-group blocks unchanged", () => {
    const settings = { name: "core/paragraph", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the faqLayout attribute for core/group", () => {
    const settings = { name: "core/group", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { faqLayout: { type: string; default: object } };
    };

    expect(result.attributes.faqLayout).toEqual({ type: "object", default: {} });
  });
});

describe("faq-layout — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    clientId: string;
    attributes: { faqLayout?: { layout?: string; columns?: number } };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  afterEach(() => {
    Object.keys(mockBlocks).forEach((key) => delete mockBlocks[key]);
  });

  it("renders only the original edit for a non-group block", () => {
    mockBlocks["1"] = { innerBlocks: [{ name: "core/details" }] };

    renderWrapped({
      name: "core/paragraph",
      clientId: "1",
      attributes: {},
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("FAQ columns behavior")).not.toBeInTheDocument();
  });

  it("renders only the original edit for a group with no details children", () => {
    mockBlocks["1"] = { innerBlocks: [{ name: "core/paragraph" }] };

    renderWrapped({ name: "core/group", clientId: "1", attributes: {}, setAttributes: jest.fn() });

    expect(screen.queryByText("FAQ columns behavior")).not.toBeInTheDocument();
  });

  it("shows the layout control for a group whose children include core/details", () => {
    mockBlocks["1"] = { innerBlocks: [{ name: "core/details" }] };

    renderWrapped({ name: "core/group", clientId: "1", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByRole("combobox", { name: /FAQ columns behavior/ })).toHaveValue("default");
    expect(
      screen.queryByRole("combobox", { name: /Independent columns count/ })
    ).not.toBeInTheDocument();
  });

  it("shows the columns count control only in independent mode", () => {
    mockBlocks["1"] = { innerBlocks: [{ name: "core/details" }] };

    renderWrapped({
      name: "core/group",
      clientId: "1",
      attributes: { faqLayout: { layout: "independent", columns: 3 } },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("combobox", { name: /Independent columns count/ })).toHaveValue("3");
  });

  it("updates the layout while preserving the existing column count", async () => {
    mockBlocks["1"] = { innerBlocks: [{ name: "core/details" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    renderWrapped({
      name: "core/group",
      clientId: "1",
      attributes: { faqLayout: { columns: 4 } },
      setAttributes,
    });
    await user.selectOptions(
      screen.getByRole("combobox", { name: /FAQ columns behavior/ }),
      "independent"
    );

    expect(setAttributes).toHaveBeenCalledWith({
      faqLayout: { columns: 4, layout: "independent" },
    });
  });

  it("updates the columns count as a number", async () => {
    mockBlocks["1"] = { innerBlocks: [{ name: "core/details" }] };
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    renderWrapped({
      name: "core/group",
      clientId: "1",
      attributes: { faqLayout: { layout: "independent", columns: 2 } },
      setAttributes,
    });
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Independent columns count/ }),
      "4"
    );

    expect(setAttributes).toHaveBeenCalledWith({
      faqLayout: { layout: "independent", columns: 4 },
    });
  });
});

describe("faq-layout — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: { faqLayout?: { layout?: string; columns?: number } };
    className?: string;
  }

  function OriginalBlockListBlock(props: Props) {
    return <div data-testid="block-list-block" className={props.className} />;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("does not add a class for the default layout", () => {
    renderWrapped({ attributes: {}, className: "existing" });

    expect(screen.getByTestId("block-list-block")).toHaveClass("existing");
    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("merges the independent-columns class with the existing className", () => {
    renderWrapped({
      attributes: { faqLayout: { layout: "independent", columns: 3 } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe(
      "existing kt-faq-independent-columns-3"
    );
  });
});
