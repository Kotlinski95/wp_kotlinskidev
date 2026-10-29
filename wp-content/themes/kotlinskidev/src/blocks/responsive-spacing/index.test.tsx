import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface UnitControlProps {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

jest.mock("@wordpress/components", () => {
  const actual = jest.requireActual("@wordpress/components");
  return {
    ...actual,
    __experimentalUnitControl: ({ label, value, onChange }: UnitControlProps) => (
      <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
    ),
  };
});

import "./index";

type SpacingSideValues = { top: string; right: string; bottom: string; left: string };

const ZERO: SpacingSideValues = { top: "0px", right: "0px", bottom: "0px", left: "0px" };

afterEach(() => {
  delete window.kotlinskidevBreakpoints;
});

function deviceSection(label: string) {
  return screen.getByText(label).closest("div") as HTMLElement;
}

function spacingGroup(deviceLabel: string, type: "Padding" | "Margin") {
  return within(deviceSection(deviceLabel)).getByText(type).parentElement as HTMLElement;
}

describe("responsive-spacing — blocks.registerBlockType filter", () => {
  it("adds a padding and margin attribute per device, each defaulting to zero on every side", () => {
    const settings = { attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, { type: string; default: SpacingSideValues }>;
    };

    expect(result.attributes.existing).toBeDefined();
    ["desktop", "tablet", "mobile"].forEach((device) => {
      ["Padding", "Margin"].forEach((type) => {
        expect(result.attributes[`${device}${type}`]).toEqual({ type: "object", default: ZERO });
      });
    });
  });
});

describe("responsive-spacing — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    attributes: Record<string, SpacingSideValues | undefined>;
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Responsive Spacing" }));
  }

  it("keeps the panel collapsed by default", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Advanced Spacing Settings" })
    ).not.toBeInTheDocument();
  });

  it("starts with advanced settings off and no device sections when nothing is set", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Advanced Spacing Settings" })).not.toBeChecked();
    expect(screen.queryByText("Desktop")).not.toBeInTheDocument();
  });

  it("starts with advanced settings already on when a non-zero value is set on any device", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { tabletMargin: { ...ZERO, bottom: "20px" } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Advanced Spacing Settings" })).toBeChecked();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
  });

  it("reveals every device section once toggled on manually", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Advanced Spacing Settings" }));

    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("shows the default breakpoints in the device help text", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { desktopPadding: { ...ZERO, top: "10px" } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByText(/64rem and above/)).toBeInTheDocument();
    expect(screen.getByText(/48\.875rem - 63\.9375rem/)).toBeInTheDocument();
    expect(screen.getByText(/below 48\.875rem/)).toBeInTheDocument();
  });

  it("reflects custom global breakpoints in the device help text", async () => {
    window.kotlinskidevBreakpoints = {
      mobile_max: 799,
      tablet_min: 800,
      tablet_max: 1119,
      desktop_min: 1120,
    };
    const user = userEvent.setup();
    renderWrapped({
      attributes: { desktopPadding: { ...ZERO, top: "10px" } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByText(/70rem and above/)).toBeInTheDocument();
    expect(screen.getByText(/below 50rem/)).toBeInTheDocument();
  });

  it("updates a single padding side, preserving the other sides and the margin attribute", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: {
        desktopPadding: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
        desktopMargin: { ...ZERO, top: "5px" },
      },
      setAttributes,
    });
    await openPanel(user);

    const topInput = within(spacingGroup("Desktop", "Padding")).getByLabelText("Top");
    fireEvent.change(topInput, { target: { value: "20px" } });

    expect(setAttributes).toHaveBeenCalledWith({
      desktopPadding: { top: "20px", right: "10px", bottom: "10px", left: "10px" },
    });
  });

  it("updates a margin side on a different device independently", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: { mobileMargin: { ...ZERO, bottom: "5px" } },
      setAttributes,
    });
    await openPanel(user);

    const bottomInput = within(spacingGroup("Mobile", "Margin")).getByLabelText("Bottom");
    fireEvent.change(bottomInput, { target: { value: "15px" } });

    expect(setAttributes).toHaveBeenCalledWith({
      mobileMargin: { ...ZERO, bottom: "15px" },
    });
  });

  it("falls back to 0px when a side is cleared", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: { desktopPadding: { ...ZERO, left: "10px" } },
      setAttributes,
    });
    await openPanel(user);

    const leftInput = within(spacingGroup("Desktop", "Padding")).getByLabelText("Left");
    fireEvent.change(leftInput, { target: { value: "" } });

    expect(setAttributes).toHaveBeenCalledWith({
      desktopPadding: { ...ZERO, left: "0px" },
    });
  });
});

describe("responsive-spacing — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: Record<string, SpacingSideValues | undefined>;
    wrapperProps?: Record<string, unknown>;
  }

  function OriginalBlockListBlock(props: Props) {
    return (
      <div
        data-testid="block-list-block"
        data-style={JSON.stringify(props.wrapperProps?.style ?? {})}
      />
    );
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters(
      "editor.BlockListBlock",
      OriginalBlockListBlock
    ) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("leaves the block unchanged when there are no responsive-spacing attributes", () => {
    renderWrapped({ attributes: {} });

    expect(screen.getByTestId("block-list-block").getAttribute("data-style")).toBe("{}");
  });

  it("leaves the block unchanged when the desktop values are all zero", () => {
    renderWrapped({ attributes: { desktopPadding: ZERO, desktopMargin: ZERO } });

    expect(screen.getByTestId("block-list-block").getAttribute("data-style")).toBe("{}");
  });

  it("ignores non-zero tablet/mobile values, only previewing desktop", () => {
    renderWrapped({ attributes: { tabletPadding: { ...ZERO, top: "20px" } } });

    expect(screen.getByTestId("block-list-block").getAttribute("data-style")).toBe("{}");
  });

  it("maps non-zero desktop padding and margin sides to inline CSS properties", () => {
    renderWrapped({
      attributes: {
        desktopPadding: { top: "10px", right: "0px", bottom: "0px", left: "0px" },
        desktopMargin: { top: "0px", right: "0px", bottom: "5px", left: "0px" },
      },
    });

    const el = screen.getByTestId("block-list-block");
    expect(JSON.parse(el.getAttribute("data-style") ?? "{}")).toEqual({
      paddingTop: "10px",
      marginBottom: "5px",
    });
  });
});
