import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("link-hover-effects — blocks.registerBlockType filter", () => {
  it("adds the linkHoverEffects attribute with an object default", () => {
    const settings = { attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; linkHoverEffects: { type: string; default: object } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.linkHoverEffects).toEqual({ type: "object", default: {} });
  });
});

describe("link-hover-effects — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    attributes: {
      linkHoverEffects?: {
        disableBackgroundHover?: boolean;
        disableUnderlineHover?: boolean;
        disableLinkGradient?: boolean;
      };
    };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Link Hover Effects/ }));
  }

  it("always renders the original edit alongside the (collapsed) controls panel", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByText("Link Hover Effects")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("shows all three toggles unchecked by default once expanded", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(
      screen.getByRole("checkbox", { name: /Disable background hover effect/ })
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /Disable underline hover effect/ })
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /Disable link underline\/gradient effect/ })
    ).not.toBeChecked();
  });

  it("reflects existing linkHoverEffects values", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { linkHoverEffects: { disableLinkGradient: true } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(
      screen.getByRole("checkbox", { name: /Disable link underline\/gradient effect/ })
    ).toBeChecked();
  });

  it("updates only the toggled key, preserving the other flags", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      attributes: { linkHoverEffects: { disableBackgroundHover: true } },
      setAttributes,
    });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: /Disable underline hover effect/ }));

    expect(setAttributes).toHaveBeenCalledWith({
      linkHoverEffects: { disableBackgroundHover: true, disableUnderlineHover: true },
    });
  });
});
