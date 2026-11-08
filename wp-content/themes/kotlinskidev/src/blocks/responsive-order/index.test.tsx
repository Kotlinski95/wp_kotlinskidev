import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

interface ResponsiveOrder {
  desktop: number;
  tablet: number;
  mobile: number;
}

afterEach(() => {
  delete window.kotlinskidevBreakpoints;
});

describe("responsive-order — blocks.registerBlockType filter", () => {
  it("adds the responsiveOrder attribute with a zeroed default", () => {
    const settings = { attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        responsiveOrder: { type: string; default: ResponsiveOrder };
      };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.responsiveOrder).toEqual({
      type: "object",
      default: { desktop: 0, tablet: 0, mobile: 0 },
    });
  });
});

describe("responsive-order — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    attributes: { responsiveOrder?: ResponsiveOrder };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Responsive Order/ }));
  }

  it("renders the original edit and keeps the panel collapsed by default", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByLabelText("Desktop Order")).not.toBeInTheDocument();
  });

  it("defaults every order control to 0 and shows the default breakpoints in the help text", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("spinbutton", { name: "Desktop Order" })).toHaveValue(0);
    expect(screen.getByRole("spinbutton", { name: "Tablet Order" })).toHaveValue(0);
    expect(screen.getByRole("spinbutton", { name: "Mobile Order" })).toHaveValue(0);
    expect(screen.getByText(/1024px\+/)).toBeInTheDocument();
    expect(screen.getByText(/782px - 1023px/)).toBeInTheDocument();
    expect(screen.getByText(/below 781px/)).toBeInTheDocument();
  });

  it("reflects custom global breakpoints in the help text", async () => {
    window.kotlinskidevBreakpoints = {
      mobile_max: 600,
      tablet_min: 601,
      tablet_max: 900,
      desktop_min: 901,
    };
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByText(/901px\+/)).toBeInTheDocument();
    expect(screen.getByText(/601px - 900px/)).toBeInTheDocument();
    expect(screen.getByText(/below 600px/)).toBeInTheDocument();
  });

  it("reflects existing responsiveOrder values in the controls", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveOrder: { desktop: 2, tablet: -1, mobile: 5 } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("spinbutton", { name: "Desktop Order" })).toHaveValue(2);
    expect(screen.getByRole("spinbutton", { name: "Tablet Order" })).toHaveValue(-1);
    expect(screen.getByRole("spinbutton", { name: "Mobile Order" })).toHaveValue(5);
  });

  it("updates only the changed device, preserving the others", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveOrder: { desktop: 1, tablet: 2, mobile: 3 } },
      setAttributes,
    });
    await openPanel(user);

    const tabletInput = screen.getByRole("spinbutton", { name: "Tablet Order" });
    await user.clear(tabletInput);
    await user.type(tabletInput, "7");

    expect(setAttributes).toHaveBeenLastCalledWith({
      responsiveOrder: { desktop: 1, tablet: "7", mobile: 3 },
    });
  });
});

describe("responsive-order — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: { responsiveOrder?: ResponsiveOrder };
    className?: string;
  }

  function OriginalBlockListBlock({ className }: Props) {
    return <div data-testid="block-list-block" className={className} />;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("adds no extra classes when there is no responsiveOrder", () => {
    renderWrapped({ attributes: {}, className: "existing" });

    expect(screen.getByTestId("block-list-block")).toHaveClass("existing");
    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("adds no extra classes when every order value is 0", () => {
    renderWrapped({
      attributes: { responsiveOrder: { desktop: 0, tablet: 0, mobile: 0 } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("appends an order class per non-zero device value", () => {
    renderWrapped({
      attributes: { responsiveOrder: { desktop: 2, tablet: -1, mobile: 5 } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe(
      "existing  order-desktop-2 order-tablet--1 order-mobile-5"
    );
  });
});

describe("responsive-order — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when there is no responsiveOrder", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters("blocks.getSaveContent.extraProps", extraProps, {}, {}) as {
      className: string;
    };

    expect(result.className).toBe("existing");
  });

  it("leaves extraProps unchanged when every order value is 0", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { responsiveOrder: { desktop: 0, tablet: 0, mobile: 0 } }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("appends order classes to an existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { responsiveOrder: { desktop: 2, tablet: -1, mobile: 5 } }
    ) as { className: string };

    expect(result.className).toBe("existing order-desktop-2 order-tablet--1 order-mobile-5");
  });

  it("sets className from scratch when extraProps had none", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { responsiveOrder: { desktop: 3, tablet: 0, mobile: 0 } }
    ) as { className: string };

    expect(result.className).toBe("order-desktop-3");
  });
});
