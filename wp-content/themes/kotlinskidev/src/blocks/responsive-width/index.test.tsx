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
  width?: string;
  maxWidth?: string;
}

interface ResponsiveWidth {
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

describe("responsive-width — blocks.registerBlockType filter", () => {
  it("adds the responsiveWidth attribute with per-device defaults", () => {
    const settings = { attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        responsiveWidth: { type: string; default: ResponsiveWidth };
      };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.responsiveWidth).toEqual({
      type: "object",
      default: { desktop: {}, tablet: {}, mobile: {} },
    });
  });
});

describe("responsive-width — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    attributes: { responsiveWidth?: ResponsiveWidth };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Responsive Width" }));
  }

  it("keeps the panel collapsed by default", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Advanced Width Settings" })
    ).not.toBeInTheDocument();
  });

  it("starts with advanced settings off and device controls hidden when nothing is set", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Advanced Width Settings" })).not.toBeChecked();
    expect(screen.queryByText("Desktop")).not.toBeInTheDocument();
  });

  it("starts with advanced settings already on when a device value is set", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveWidth: { desktop: { width: "50%" }, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Advanced Width Settings" })).toBeChecked();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
  });

  it("reveals the device sections once Advanced Width Settings is toggled on", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Advanced Width Settings" }));

    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("shows the default breakpoints in the device help text", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveWidth: { desktop: { width: "1" }, tablet: {}, mobile: {} } },
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
      attributes: { responsiveWidth: { desktop: { width: "1" }, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByText(/70rem and above/)).toBeInTheDocument();
    expect(screen.getByText(/below 50rem/)).toBeInTheDocument();
  });

  it("updates only the changed device/property, preserving the rest", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: {
        responsiveWidth: {
          desktop: { width: "100%", maxWidth: "1200px" },
          tablet: { width: "90%" },
          mobile: {},
        },
      },
      setAttributes,
    });
    await openPanel(user);

    const tabletMaxWidth = within(deviceSection("Tablet")).getByLabelText("Max Width");
    fireEvent.change(tabletMaxWidth, { target: { value: "600px" } });

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveWidth: {
        desktop: { width: "100%", maxWidth: "1200px" },
        tablet: { width: "90%", maxWidth: "600px" },
        mobile: {},
      },
    });
  });

  it("updates a device's width", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: { responsiveWidth: { desktop: {}, tablet: {}, mobile: { width: "5" } } },
      setAttributes,
    });
    await openPanel(user);

    const mobileWidth = within(deviceSection("Mobile")).getByLabelText("Width");
    fireEvent.change(mobileWidth, { target: { value: "50vw" } });

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveWidth: { desktop: {}, tablet: {}, mobile: { width: "50vw" } },
    });
  });

  it("shows Custom value as the width preset by default and the free-text input alongside it", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);
    await user.click(screen.getByRole("checkbox", { name: "Advanced Width Settings" }));

    expect(within(deviceSection("Desktop")).getByLabelText("Width preset")).toHaveValue(
      "__custom__"
    );
    expect(within(deviceSection("Desktop")).getByLabelText("Width")).toBeInTheDocument();
  });

  it("picks a css sizing keyword for width and hides the free-text input", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: { responsiveWidth: { desktop: {}, tablet: {}, mobile: {} } },
      setAttributes,
    });
    await openPanel(user);
    await user.click(screen.getByRole("checkbox", { name: "Advanced Width Settings" }));

    await user.selectOptions(
      within(deviceSection("Desktop")).getByLabelText("Width preset"),
      "fit-content"
    );

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveWidth: { desktop: { width: "fit-content" }, tablet: {}, mobile: {} },
    });
  });

  it("recognizes an existing keyword value and hides the free-text input for it", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: {
        responsiveWidth: { desktop: { maxWidth: "max-content" }, tablet: {}, mobile: {} },
      },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(within(deviceSection("Desktop")).getByLabelText("Max width preset")).toHaveValue(
      "max-content"
    );
    expect(within(deviceSection("Desktop")).queryByLabelText("Max Width")).not.toBeInTheDocument();
  });

  it("switching the preset back to Custom value clears the stored keyword", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: {
        responsiveWidth: { desktop: { width: "stretch" }, tablet: {}, mobile: {} },
      },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(
      within(deviceSection("Desktop")).getByLabelText("Width preset"),
      "Custom value"
    );

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveWidth: { desktop: { width: "" }, tablet: {}, mobile: {} },
    });
  });
});

describe("responsive-width — editor.BlockListBlock filter", () => {
  interface Props {
    attributes?: { responsiveWidth?: ResponsiveWidth };
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

  it("leaves the block unchanged when there is no responsiveWidth", () => {
    renderWrapped({ attributes: {}, className: "existing" });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing");
  });

  it("leaves the block unchanged when every device is empty", () => {
    renderWrapped({
      attributes: { responsiveWidth: { desktop: {}, tablet: {}, mobile: {} } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("adds the responsive-width class and CSS variables for set devices", () => {
    renderWrapped({
      attributes: {
        responsiveWidth: {
          desktop: { width: "100%", maxWidth: "1200px" },
          tablet: {},
          mobile: { width: "50vw" },
        },
      },
      className: "existing",
    });

    const el = screen.getByTestId("block-list-block");
    expect(el.className).toBe("existing kt-has-responsive-width");
    expect(JSON.parse(el.getAttribute("data-style") ?? "{}")).toEqual({
      "--kt-width-desktop": "100%",
      "--kt-max-width-desktop": "1200px",
      "--kt-width-mobile": "50vw",
    });
  });
});
