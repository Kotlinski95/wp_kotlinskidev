import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("parallax — blocks.registerBlockType filter", () => {
  it("leaves settings unchanged for a non-cover block", () => {
    const settings = { attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings, "core/group");

    expect(result).toBe(settings);
  });

  it("adds the enableParallax attribute for core/cover", () => {
    const settings = { attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings, "core/cover") as {
      attributes: { existing: unknown; enableParallax: { type: string; default: boolean } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.enableParallax).toEqual({ type: "boolean", default: false });
  });
});

describe("parallax — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { enableParallax?: boolean };
    setAttributes: (attrs: Record<string, unknown>) => void;
    clientId: string;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders only the original edit for a non-cover block", () => {
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn(), clientId: "1" });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Parallax Settings")).not.toBeInTheDocument();
  });

  it("shows a collapsed parallax panel for core/cover", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/cover", attributes: {}, setAttributes: jest.fn(), clientId: "1" });

    expect(screen.getByText("Parallax Settings")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Parallax Settings/ }));
    expect(screen.getByRole("checkbox", { name: /Enable Parallax Effect/ })).not.toBeChecked();
  });

  it("reflects an enabled parallax value once expanded", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/cover",
      attributes: { enableParallax: true },
      setAttributes: jest.fn(),
      clientId: "1",
    });

    await user.click(screen.getByRole("button", { name: /Parallax Settings/ }));

    expect(screen.getByRole("checkbox", { name: /Enable Parallax Effect/ })).toBeChecked();
  });

  it("calls setAttributes when the toggle is clicked", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/cover",
      attributes: { enableParallax: false },
      setAttributes,
      clientId: "1",
    });

    await user.click(screen.getByRole("button", { name: /Parallax Settings/ }));
    await user.click(screen.getByRole("checkbox", { name: /Enable Parallax Effect/ }));

    expect(setAttributes).toHaveBeenCalledWith({ enableParallax: true });
  });
});
