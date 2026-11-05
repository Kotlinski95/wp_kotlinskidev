import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorAdvancedControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("active-link-state — blocks.registerBlockType filter", () => {
  it("adds the activeLinkState attribute with an object default, preserving existing attributes", () => {
    const settings = { name: "core/group", attributes: { existing: { type: "string" } } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; activeLinkState: { type: string; default: object } };
    };

    expect(result.attributes.existing).toEqual({ type: "string" });
    expect(result.attributes.activeLinkState).toEqual({ type: "object", default: {} });
  });
});

describe("active-link-state — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    attributes: { activeLinkState?: { disableActiveState?: boolean } };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("always renders the original edit plus the disable toggle", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Disable active-page highlight/ })
    ).not.toBeChecked();
  });

  it("reflects an existing disableActiveState value", () => {
    renderWrapped({
      attributes: { activeLinkState: { disableActiveState: true } },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("checkbox", { name: /Disable active-page highlight/ })).toBeChecked();
  });

  it("merges the new value into activeLinkState on toggle, preserving other keys", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      attributes: { activeLinkState: { disableActiveState: false } },
      setAttributes,
    });

    await user.click(screen.getByRole("checkbox", { name: /Disable active-page highlight/ }));

    expect(setAttributes).toHaveBeenCalledWith({
      activeLinkState: { disableActiveState: true },
    });
  });
});
