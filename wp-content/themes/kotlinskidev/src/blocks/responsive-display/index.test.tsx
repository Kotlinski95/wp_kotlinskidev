import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

interface DeviceSettings {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  justifySelf?: string;
  alignSelf?: string;
}

interface ResponsiveDisplay {
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

describe("responsive-display — blocks.registerBlockType filter", () => {
  it("adds the responsiveDisplay attribute with a per-device default", () => {
    const settings = { attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        existing: unknown;
        responsiveDisplay: { type: string; default: ResponsiveDisplay };
      };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.responsiveDisplay).toEqual({
      type: "object",
      default: { desktop: {}, tablet: {}, mobile: {} },
    });
  });
});

describe("responsive-display — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    attributes: { responsiveDisplay?: ResponsiveDisplay };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Display & Layout" }));
  }

  it("keeps the panel collapsed by default", () => {
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Advanced Display Settings" })
    ).not.toBeInTheDocument();
  });

  it("starts with advanced settings off and no device sections when nothing is set", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Advanced Display Settings" })).not.toBeChecked();
    expect(screen.queryByText("Desktop")).not.toBeInTheDocument();
  });

  it("starts with advanced settings already on when any device has a value", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: {}, tablet: { display: "flex" }, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: "Advanced Display Settings" })).toBeChecked();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
  });

  it("reveals every device section once toggled on manually", async () => {
    const user = userEvent.setup();
    renderWrapped({ attributes: {}, setAttributes: jest.fn() });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Advanced Display Settings" }));

    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("shows the default breakpoints in the device help text", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: { display: "flex" }, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByText(/64rem and above/)).toBeInTheDocument();
    expect(screen.getByText(/48\.875rem - 63\.9375rem/)).toBeInTheDocument();
    expect(screen.getByText(/below 48\.875rem/)).toBeInTheDocument();
  });

  it("only shows Display and Justify/Align Self controls when no display type is set", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: {}, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);
    await user.click(screen.getByRole("checkbox", { name: "Advanced Display Settings" }));

    const desktop = within(deviceSection("Desktop"));
    expect(desktop.getByRole("combobox", { name: "Display" })).toBeInTheDocument();
    expect(desktop.getByRole("combobox", { name: "Justify Self" })).toBeInTheDocument();
    expect(desktop.getByRole("combobox", { name: "Align Self" })).toBeInTheDocument();
    expect(desktop.queryByRole("combobox", { name: "Flex Direction" })).not.toBeInTheDocument();
    expect(desktop.queryByRole("combobox", { name: "Justify Content" })).not.toBeInTheDocument();
    expect(desktop.queryByRole("combobox", { name: "Align Items" })).not.toBeInTheDocument();
  });

  it("shows Flex Direction, Justify Content, and Align Items once display is flex", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: { display: "flex" }, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    const desktop = within(deviceSection("Desktop"));
    expect(desktop.getByRole("combobox", { name: "Flex Direction" })).toBeInTheDocument();
    expect(desktop.getByRole("combobox", { name: "Justify Content" })).toBeInTheDocument();
    expect(desktop.getByRole("combobox", { name: "Align Items" })).toBeInTheDocument();
  });

  it("shows Justify Content and Align Items but not Flex Direction once display is grid", async () => {
    const user = userEvent.setup();
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: { display: "grid" }, tablet: {}, mobile: {} } },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    const desktop = within(deviceSection("Desktop"));
    expect(desktop.getByRole("combobox", { name: "Justify Content" })).toBeInTheDocument();
    expect(desktop.getByRole("combobox", { name: "Align Items" })).toBeInTheDocument();
    expect(desktop.queryByRole("combobox", { name: "Flex Direction" })).not.toBeInTheDocument();
  });

  it("updates the display value for one device, preserving the rest", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: {
        responsiveDisplay: {
          desktop: {},
          tablet: { display: "block" },
          mobile: { justifySelf: "justify-self-center" },
        },
      },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(
      within(deviceSection("Desktop")).getByRole("combobox", { name: "Display" }),
      "Flex"
    );

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveDisplay: {
        desktop: { display: "flex" },
        tablet: { display: "block" },
        mobile: { justifySelf: "justify-self-center" },
      },
    });
  });

  it("updates flex direction, justify content, and align items independently", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: { display: "flex" }, tablet: {}, mobile: {} } },
      setAttributes,
    });
    await openPanel(user);
    const desktop = within(deviceSection("Desktop"));

    await user.selectOptions(desktop.getByRole("combobox", { name: "Flex Direction" }), "Column");
    expect(setAttributes).toHaveBeenLastCalledWith({
      responsiveDisplay: {
        desktop: { display: "flex", flexDirection: "flex-column" },
        tablet: {},
        mobile: {},
      },
    });

    await user.selectOptions(desktop.getByRole("combobox", { name: "Justify Content" }), "Start");
    expect(setAttributes).toHaveBeenLastCalledWith({
      responsiveDisplay: {
        desktop: { display: "flex", justifyContent: "justify-content-start" },
        tablet: {},
        mobile: {},
      },
    });

    await user.selectOptions(desktop.getByRole("combobox", { name: "Align Items" }), "End");
    expect(setAttributes).toHaveBeenLastCalledWith({
      responsiveDisplay: {
        desktop: { display: "flex", alignItems: "align-items-end" },
        tablet: {},
        mobile: {},
      },
    });
  });

  it("updates justify-self and align-self on a specific device", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: {}, tablet: {}, mobile: {} } },
      setAttributes,
    });
    await openPanel(user);
    await user.click(screen.getByRole("checkbox", { name: "Advanced Display Settings" }));
    const mobile = within(deviceSection("Mobile"));

    await user.selectOptions(mobile.getByRole("combobox", { name: "Justify Self" }), "Stretch");
    expect(setAttributes).toHaveBeenLastCalledWith({
      responsiveDisplay: {
        desktop: {},
        tablet: {},
        mobile: { justifySelf: "justify-self-stretch" },
      },
    });

    await user.selectOptions(mobile.getByRole("combobox", { name: "Align Self" }), "Center");
    expect(setAttributes).toHaveBeenLastCalledWith({
      responsiveDisplay: { desktop: {}, tablet: {}, mobile: { alignSelf: "align-self-center" } },
    });
  });
});

describe("responsive-display — editor.BlockListBlock filter", () => {
  interface Props {
    attributes: { responsiveDisplay?: ResponsiveDisplay };
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

  it("adds no extra classes when there is no responsiveDisplay", () => {
    renderWrapped({ attributes: {}, className: "existing" });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("adds no extra classes when every device is empty", () => {
    renderWrapped({
      attributes: { responsiveDisplay: { desktop: {}, tablet: {}, mobile: {} } },
      className: "existing",
    });

    expect(screen.getByTestId("block-list-block").className).toBe("existing");
  });

  it("appends a prefixed class per set property across devices", () => {
    renderWrapped({
      attributes: {
        responsiveDisplay: {
          desktop: { display: "flex", justifyContent: "justify-content-center" },
          tablet: { display: "grid" },
          mobile: { alignSelf: "align-self-end" },
        },
      },
      className: "existing",
    });

    const className = screen.getByTestId("block-list-block").className;
    expect(className).toContain("desktop:flex");
    expect(className).toContain("desktop:justify-content-center");
    expect(className).toContain("tablet:grid");
    expect(className).toContain("mobile:align-self-end");
  });
});

describe("responsive-display — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when there is no responsiveDisplay", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters("blocks.getSaveContent.extraProps", extraProps, {}, {}) as {
      className: string;
    };

    expect(result.className).toBe("existing");
  });

  it("leaves extraProps unchanged when every device is empty", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { responsiveDisplay: { desktop: {}, tablet: {}, mobile: {} } }
    ) as { className: string };

    expect(result.className).toBe("existing");
  });

  it("appends prefixed classes to an existing className", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { responsiveDisplay: { desktop: { display: "block" }, tablet: {}, mobile: {} } }
    ) as { className: string };

    expect(result.className).toBe("existing desktop:block");
  });

  it("sets className from scratch when extraProps had none", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        responsiveDisplay: { desktop: {}, tablet: {}, mobile: { justifySelf: "justify-self-end" } },
      }
    ) as { className: string };

    expect(result.className).toBe("mobile:justify-self-end");
  });

  it("combines multiple set properties across all three devices", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      {
        responsiveDisplay: {
          desktop: { display: "flex", flexDirection: "flex-row" },
          tablet: { justifyContent: "justify-content-end" },
          mobile: { display: "block", alignSelf: "align-self-stretch" },
        },
      }
    ) as { className: string };

    expect(result.className).toBe(
      "desktop:flex desktop:flex-row tablet:justify-content-end mobile:block mobile:align-self-stretch"
    );
  });
});
