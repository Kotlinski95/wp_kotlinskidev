import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import { createReduxStore, register } from "@wordpress/data";
import type { ComponentType } from "react";

const mockHasBlockSupport = jest.fn(() => true);

jest.mock("@wordpress/blocks", () => ({
  hasBlockSupport: (...args: unknown[]) => mockHasBlockSupport(...args),
}));

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  store: "core/block-editor",
}));

const mockFontSizes: {
  current: Array<{ name: string; slug: string; size: string }>;
} = { current: [] };

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    selectors: {
      getSettings: () => ({ fontSizes: mockFontSizes.current }),
    },
  })
);

import "./index";

interface ResponsiveFontSize {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  mobileCustom?: boolean;
  tabletCustom?: boolean;
  desktopCustom?: boolean;
  mobilePreset?: string;
  tabletPreset?: string;
  desktopPreset?: string;
  mobileCustomValue?: string;
  tabletCustomValue?: string;
  desktopCustomValue?: string;
}

afterEach(() => {
  delete window.kotlinskidevBreakpoints;
  mockFontSizes.current = [];
  mockHasBlockSupport.mockReturnValue(true);
});

describe("responsive-font-size — blocks.registerBlockType filter", () => {
  it("leaves a block without typography support unchanged", () => {
    const settings = { supports: {}, attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the responsiveFontSize attribute for a block with typography support", () => {
    const settings = { supports: { typography: true }, attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { existing: unknown; responsiveFontSize: { type: string; default: object } };
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.responsiveFontSize).toEqual({ type: "object", default: {} });
  });
});

describe("responsive-font-size — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { responsiveFontSize?: ResponsiveFontSize };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function expandControl(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Responsive font size/ }));
  }

  it("renders only the original edit when the block has no typography support", () => {
    mockHasBlockSupport.mockReturnValue(false);
    renderWrapped({ name: "core/code", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText(/Responsive font size/)).not.toBeInTheDocument();
  });

  it("renders the collapsed inline control for a block with typography support", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Responsive font size/ })).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows no dot indicator when no responsive values are set", () => {
    const { container } = renderWrapped({
      name: "core/paragraph",
      attributes: {},
      setAttributes: jest.fn(),
    });

    expect(container.querySelector('span[style*="border-radius: 50%"]')).toBeNull();
  });

  it("shows a dot indicator once any device value is set", () => {
    const { container } = renderWrapped({
      name: "core/paragraph",
      attributes: { responsiveFontSize: { mobile: "1.5rem" } },
      setAttributes: jest.fn(),
    });

    expect(container.querySelector('span[style*="border-radius: 50%"]')).not.toBeNull();
  });

  it("expands to reveal the per-breakpoint controls", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    await expandControl(user);

    expect(screen.getByText("Mobile")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
  });

  it("shows the default breakpoint ranges", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });
    await expandControl(user);

    expect(screen.getByText("(< 48.875rem)")).toBeInTheDocument();
    expect(screen.getByText("(48.875rem - 63.938rem)")).toBeInTheDocument();
    expect(screen.getByText("(≥ 64rem)")).toBeInTheDocument();
  });

  it("reflects custom global breakpoints in the ranges", async () => {
    window.kotlinskidevBreakpoints = {
      mobile_max: 799,
      tablet_min: 800,
      tablet_max: 1119,
      desktop_min: 1120,
    };
    const user = userEvent.setup();
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });
    await expandControl(user);

    expect(screen.getByText("(< 50rem)")).toBeInTheDocument();
    expect(screen.getByText("(≥ 70rem)")).toBeInTheDocument();
  });

  it("lists the theme font sizes with a Default option first", async () => {
    mockFontSizes.current = [
      { name: "Small", slug: "small", size: "0.875rem" },
      { name: "Large", slug: "large", size: "2rem" },
    ];
    const user = userEvent.setup();
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });
    await expandControl(user);

    const mobileSelect = screen.getAllByRole("combobox")[0];
    const options = within(mobileSelect).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Default", "Small", "Large"]);
  });

  it("updates the mobile font size from a preset selection", async () => {
    mockFontSizes.current = [{ name: "Large", slug: "large", size: "2rem" }];
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes });
    await expandControl(user);

    await user.selectOptions(screen.getAllByRole("combobox")[0], "Large");

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveFontSize: {
        mobile: "2rem",
        mobileCustom: false,
        mobilePreset: "2rem",
        mobileCustomValue: "1rem",
      },
    });
  });

  it("updates the tablet and desktop font sizes independently", async () => {
    mockFontSizes.current = [{ name: "Large", slug: "large", size: "2rem" }];
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: { responsiveFontSize: { mobile: "1.2rem" } },
      setAttributes,
    });
    await expandControl(user);

    await user.selectOptions(screen.getAllByRole("combobox")[2], "Large");

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveFontSize: {
        mobile: "1.2rem",
        desktop: "2rem",
        desktopCustom: false,
        desktopPreset: "2rem",
        desktopCustomValue: "1rem",
      },
    });
  });

  it("switches a breakpoint to a custom size, deriving the numeric value from the existing size", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/paragraph",
      attributes: { responsiveFontSize: { mobile: "2.5rem" } },
      setAttributes: jest.fn(),
    });
    await expandControl(user);

    await user.click(screen.getAllByRole("button", { name: "Set custom size" })[0]);

    expect(screen.getByRole("slider")).toHaveValue("2.5");
  });

  it("updates the custom slider value, marking the breakpoint as custom", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: { responsiveFontSize: { mobile: "2rem", mobileCustom: true } },
      setAttributes,
    });
    await expandControl(user);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "3" } });

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveFontSize: {
        mobile: "3rem",
        mobileCustom: true,
        mobilePreset: "",
        mobileCustomValue: "3rem",
      },
    });
  });

  it("reverts to the preset value when custom mode is turned back off", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/paragraph",
      attributes: {
        responsiveFontSize: {
          mobile: "3rem",
          mobileCustom: true,
          mobilePreset: "2rem",
          mobileCustomValue: "3rem",
        },
      },
      setAttributes,
    });
    await expandControl(user);

    await user.click(screen.getAllByRole("button", { name: "Set custom size" })[0]);

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveFontSize: {
        mobile: "2rem",
        mobileCustom: false,
        mobilePreset: "2rem",
        mobileCustomValue: "3rem",
      },
    });
  });
});
