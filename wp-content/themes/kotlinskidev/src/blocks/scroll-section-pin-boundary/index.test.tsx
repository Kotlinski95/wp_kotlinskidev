import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("scroll-section-pin-boundary — blocks.registerBlockType filter", () => {
  it("adds the scrollSectionPinBoundary attribute for a normal block", () => {
    const settings = { name: "core/group", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { scrollSectionPinBoundary: { type: string; default: boolean } };
    };

    expect(result.attributes.scrollSectionPinBoundary).toEqual({
      type: "boolean",
      default: false,
    });
  });

  it.each(["core/html", "core/code", "core/preformatted", "core/verse"])(
    "leaves settings unchanged for excluded block %s",
    (name) => {
      const settings = { name, attributes: {} };

      expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
    }
  );

  it("leaves settings unchanged for a dynamic-preview block", () => {
    const settings = { name: "kotlinskidev/article-card", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("leaves settings unchanged when the block declares no attributes at all", () => {
    const settings = { name: "core/group" };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });
});

describe("scroll-section-pin-boundary — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { scrollSectionPinBoundary?: boolean };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("renders only the original edit for an excluded block", () => {
    renderWrapped({ name: "core/html", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Scroll Section Pinning (GSAP)")).not.toBeInTheDocument();
  });

  it("shows the toggle unchecked by default", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Scroll Section Pinning \(GSAP\)/ }));

    expect(
      screen.getByRole("checkbox", { name: /Use as scroll-section pin boundary/ })
    ).not.toBeChecked();
  });

  it("shows the toggle checked once enabled", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { scrollSectionPinBoundary: true },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Scroll Section Pinning \(GSAP\)/ }));

    expect(
      screen.getByRole("checkbox", { name: /Use as scroll-section pin boundary/ })
    ).toBeChecked();
  });

  it("calls setAttributes when toggled", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Scroll Section Pinning \(GSAP\)/ }));
    await user.click(screen.getByRole("checkbox", { name: /Use as scroll-section pin boundary/ }));

    expect(setAttributes).toHaveBeenCalledWith({ scrollSectionPinBoundary: true });
  });
});

describe("scroll-section-pin-boundary — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when the attribute is not set", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      {},
      { scrollSectionPinBoundary: false }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("appends the class onto an existing className when enabled", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      {},
      { scrollSectionPinBoundary: true }
    ) as { className: string };

    expect(result.className).toBe("existing scroll-section-pin-boundary");
  });

  it("sets the class as the sole className when none existed", () => {
    const extraProps: Record<string, unknown> = {};

    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      extraProps,
      {},
      { scrollSectionPinBoundary: true }
    ) as { className: string };

    expect(result.className).toBe("scroll-section-pin-boundary");
  });
});
