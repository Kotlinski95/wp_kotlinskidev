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

interface DeviceSettings {
  minHeight?: string;
}

interface ResponsiveHeight {
  desktop: DeviceSettings;
  tablet: DeviceSettings;
  mobile: DeviceSettings;
}

afterEach(() => {
  delete window.kotlinskidevBreakpoints;
});

function deviceSection(label: string) {
  return screen.getByText(label).closest("div") as HTMLElement;
}

describe("responsive-height — blocks.registerBlockType filter", () => {
  it("adds the responsiveHeight attribute with per-device defaults", () => {
    const settings = { attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        responsiveHeight: { type: string; default: ResponsiveHeight };
      };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.responsiveHeight).toEqual({
      type: "object",
      default: { desktop: {}, tablet: {}, mobile: {} },
    });
  });
});

describe("responsive-height — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    attributes: { responsiveHeight?: ResponsiveHeight };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Responsive Min Height" }));
  }

  it("keeps the panel collapsed by default", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Advanced Min Height Settings" })
    ).not.toBeInTheDocument();
  });

  it("starts with advanced settings off and device controls hidden when nothing is set", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(
      screen.getByRole("checkbox", { name: "Advanced Min Height Settings" })
    ).not.toBeChecked();
    expect(screen.queryByText("Desktop")).not.toBeInTheDocument();
  });

  it("starts with advanced settings already on when a device value is set", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveHeight: { desktop: { minHeight: "300px" }, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Advanced Min Height Settings" })).toBeChecked();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
  });

  it("reveals the device sections once Advanced Min Height Settings is toggled on", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Advanced Min Height Settings" }));

    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("shows the default breakpoints in the device help text", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveHeight: { desktop: { minHeight: "1px" }, tablet: {}, mobile: {} } },
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
      attributes: { responsiveHeight: { desktop: { minHeight: "1px" }, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByText(/70rem and above/)).toBeInTheDocument();
    expect(screen.getByText(/below 50rem/)).toBeInTheDocument();
  });

  it("updates only the changed device, preserving the rest", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: {
        responsiveHeight: {
          desktop: { minHeight: "430px" },
          tablet: { minHeight: "300px" },
          mobile: {},
        },
      },
      setAttributes,
    });
    await openPanel(user);

    const mobileMinHeight = within(deviceSection("Mobile")).getByLabelText("Min Height");
    fireEvent.change(mobileMinHeight, { target: { value: "200px" } });

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveHeight: {
        desktop: { minHeight: "430px" },
        tablet: { minHeight: "300px" },
        mobile: { minHeight: "200px" },
      },
    });
  });

  it("shows Custom value as the min-height preset by default and the free-text input alongside it", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);
    await user.click(screen.getByRole("checkbox", { name: "Advanced Min Height Settings" }));

    expect(within(deviceSection("Desktop")).getByLabelText("Min height preset")).toHaveValue(
      "__custom__"
    );
    expect(within(deviceSection("Desktop")).getByLabelText("Min Height")).toBeInTheDocument();
  });

  it("picks the none keyword for min-height and hides the free-text input", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: { responsiveHeight: { desktop: {}, tablet: {}, mobile: {} } },
      setAttributes,
    });
    await openPanel(user);
    await user.click(screen.getByRole("checkbox", { name: "Advanced Min Height Settings" }));

    await user.selectOptions(
      within(deviceSection("Desktop")).getByLabelText("Min height preset"),
      "none"
    );

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveHeight: { desktop: { minHeight: "none" }, tablet: {}, mobile: {} },
    });
  });

  it("recognizes an existing keyword value and hides the free-text input for it", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: {
        responsiveHeight: { desktop: { minHeight: "none" }, tablet: {}, mobile: {} },
      },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(within(deviceSection("Desktop")).getByLabelText("Min height preset")).toHaveValue(
      "none"
    );
    expect(within(deviceSection("Desktop")).queryByLabelText("Min Height")).not.toBeInTheDocument();
  });

  it("switching the preset back to Custom value clears the stored keyword", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: {
        responsiveHeight: { desktop: { minHeight: "none" }, tablet: {}, mobile: {} },
      },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(
      within(deviceSection("Desktop")).getByLabelText("Min height preset"),
      "Custom value"
    );

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveHeight: { desktop: { minHeight: "" }, tablet: {}, mobile: {} },
    });
  });
});

describe("responsive-height — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: { responsiveHeight?: ResponsiveHeight };
    className?: string;
    wrapperProps?: Record<string, unknown>;
  }

  function OriginalBlockListBlock(props: Props) {
    return (
      <div
        data-testid="block-list-block"
        className={props.className}
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

  it("leaves the block unchanged when there is no responsiveHeight", () => {
    renderWrapped({ attributes: {}, className: "existing" });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing");
  });

  it("leaves the block unchanged when every device is empty", () => {
    renderWrapped({
      attributes: { responsiveHeight: { desktop: {}, tablet: {}, mobile: {} } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("adds per-breakpoint responsive-height classes and CSS variables for set devices", () => {
    renderWrapped({
      attributes: {
        responsiveHeight: {
          desktop: { minHeight: "430px" },
          tablet: {},
          mobile: { minHeight: "200px" },
        },
      },
      className: "existing",
    });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe(
      "existing kt-has-responsive-height-desktop kt-has-responsive-height-tablet kt-has-responsive-height-mobile"
    );
    expect(JSON.parse(el.getAttribute("data-style") ?? "{}")).toEqual({
      "--kt-min-height-desktop": "430px",
      "--kt-min-height-mobile": "200px",
    });
  });

  it("does not add the desktop class when only mobile is set", () => {
    renderWrapped({
      attributes: {
        responsiveHeight: { desktop: {}, tablet: {}, mobile: { minHeight: "200px" } },
      },
      className: "existing",
    });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing kt-has-responsive-height-mobile");
  });
});
