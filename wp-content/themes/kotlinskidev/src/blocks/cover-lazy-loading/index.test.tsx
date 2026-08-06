import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("cover-lazy-loading — blocks.registerBlockType filter", () => {
  it("leaves settings unchanged for an unsupported block", () => {
    const settings = { attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings, "core/group")).toBe(settings);
  });

  it.each(["core/cover", "core/image"])(
    "adds the kotlinskidevSkipLazy attribute for %s",
    (blockName) => {
      const settings = { attributes: {} };

      const result = applyFilters("blocks.registerBlockType", settings, blockName) as {
        attributes: { kotlinskidevSkipLazy: { type: string; default: boolean } };
      };

      expect(result.attributes.kotlinskidevSkipLazy).toEqual({ type: "boolean", default: false });
    }
  );
});

describe("cover-lazy-loading — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { kotlinskidevSkipLazy?: boolean };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders only the original edit for an unsupported block", () => {
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Lazy Loading Settings")).not.toBeInTheDocument();
  });

  it("shows the default lazy-loading help text when not skipped", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/cover", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Lazy Loading Settings/ }));

    expect(screen.getByText("This cover image will use default lazy loading.")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Skip Lazy Loading/ })).not.toBeChecked();
  });

  it("shows the skipped help text and checked state once enabled", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/image",
      attributes: { kotlinskidevSkipLazy: true },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Lazy Loading Settings/ }));

    expect(screen.getByText("This cover image will not be lazy loaded.")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Skip Lazy Loading/ })).toBeChecked();
  });

  it("calls setAttributes when toggled", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/cover", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Lazy Loading Settings/ }));
    await user.click(screen.getByRole("checkbox", { name: /Skip Lazy Loading/ }));

    expect(setAttributes).toHaveBeenCalledWith({ kotlinskidevSkipLazy: true });
  });
});
