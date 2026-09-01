import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

interface ColorGradientControlProps {
  label: string;
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (value: string | undefined) => void;
  onGradientChange?: (value: string | undefined) => void;
}

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: ({ allowedBlocks, template }: { allowedBlocks: string[]; template: unknown[] }) => (
    <div
      data-testid="inner-blocks"
      data-allowed={allowedBlocks.join(",")}
      data-template-length={template.length}
    />
  ),
  __experimentalColorGradientControl: (props: ColorGradientControlProps) => (
    <div>
      <span>{props.label}</span>
      <button onClick={() => props.onColorChange("#123456")}>set-color-{props.label}</button>
      <button onClick={() => props.onColorChange(undefined)}>clear-color-{props.label}</button>
      {props.onGradientChange && (
        <>
          <button onClick={() => props.onGradientChange?.("linear-gradient(90deg,#000,#fff)")}>
            set-gradient-{props.label}
          </button>
          <button
            onClick={() => {
              props.onColorChange("#123456");
              props.onGradientChange?.(undefined);
            }}
          >
            swatch-click-{props.label}
          </button>
        </>
      )}
    </div>
  ),
}));

interface TabItemBlock {
  clientId: string;
}

const mockBlocks: Record<string, { innerBlocks: TabItemBlock[] } | undefined> = {};
const mockSelectedBlockClientId = { current: null as string | null };
const mockBlockParents: { current: (id: string) => string[] } = { current: () => [] };

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    actions: {},
    selectors: {
      getBlock: (_state: unknown, clientId: string) => mockBlocks[clientId],
      getSelectedBlockClientId: () => mockSelectedBlockClientId.current,
      getBlockParents: (_state: unknown, id: string) => mockBlockParents.current(id),
    },
  })
);

import Edit from "./edit";

function items(count: number): TabItemBlock[] {
  return Array.from({ length: count }, (_, i) => ({ clientId: `item-${i}` }));
}

function baseAttributes() {
  return {
    navPosition: "top" as const,
    navPositionMobile: "top" as const,
    navGap: { desktop: 8 },
    activeTabUnderline: true,
    activeTabTextColorEnabled: false,
    activeTabColor: "",
    activeTabBackgroundEnabled: false,
    activeTabBackgroundColor: "",
  };
}

function setup(
  innerBlocks: TabItemBlock[],
  attributes: Partial<ReturnType<typeof baseAttributes>> = {}
) {
  mockBlocks["1"] = { innerBlocks };
  const setAttributes = jest.fn();
  const utils = render(
    <Edit
      clientId="1"
      attributes={{ ...baseAttributes(), ...attributes }}
      setAttributes={setAttributes}
    />
  );
  return { ...utils, setAttributes };
}

describe("content-tabs Edit", () => {
  beforeEach(() => {
    mockSelectedBlockClientId.current = null;
    mockBlockParents.current = () => [];
    Object.keys(mockBlocks).forEach((key) => delete mockBlocks[key]);
  });

  it("restricts inner blocks to content-tabs-item with a three-item starter template", () => {
    setup([]);

    const innerBlocks = screen.getByTestId("inner-blocks");
    expect(innerBlocks).toHaveAttribute("data-allowed", "kotlinskidev/content-tabs-item");
    expect(innerBlocks).toHaveAttribute("data-template-length", "3");
  });

  it("updates the navPosition attribute when the desktop position Select control changes", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([]);

    await user.selectOptions(screen.getByLabelText("Desktop position"), "left");

    expect(setAttributes).toHaveBeenCalledWith({ navPosition: "left" });
  });

  it("updates the navPositionMobile attribute when the mobile position Select control changes, offering only top/bottom", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([]);

    const mobileSelect = screen.getByLabelText("Mobile position") as HTMLSelectElement;
    const optionValues = Array.from(mobileSelect.options).map((option) => option.value);
    expect(optionValues).toEqual(["top", "bottom"]);

    await user.selectOptions(mobileSelect, "bottom");

    expect(setAttributes).toHaveBeenCalledWith({ navPositionMobile: "bottom" });
  });

  it("updates the desktop navGap value from its slider, preserving other devices", async () => {
    const { setAttributes } = setup([], { navGap: { desktop: 8, tablet: 12 } });

    fireEvent.change(screen.getByRole("slider", { name: "Desktop" }), {
      target: { value: "16" },
    });

    expect(setAttributes).toHaveBeenCalledWith({ navGap: { desktop: 16, tablet: 12 } });
  });

  it("updates the tablet and mobile navGap values independently", async () => {
    const { setAttributes } = setup([], { navGap: { desktop: 8 } });

    fireEvent.change(screen.getByRole("slider", { name: "Tablet" }), {
      target: { value: "20" },
    });
    expect(setAttributes).toHaveBeenCalledWith({ navGap: { desktop: 8, tablet: 20 } });

    fireEvent.change(screen.getByRole("slider", { name: "Mobile" }), {
      target: { value: "4" },
    });
    expect(setAttributes).toHaveBeenCalledWith({ navGap: { desktop: 8, mobile: 4 } });
  });

  it("reflects the desktop navGap value on the slider and as a CSS custom property on the wrapper", () => {
    const { container } = setup([], { navGap: { desktop: 24 } });

    expect(screen.getByRole("slider", { name: "Desktop" })).toHaveValue("24");
    expect(
      (container.querySelector(".kt-content-tabs-editor") as HTMLElement).style.getPropertyValue(
        "--kt-content-tabs-nav-gap-desktop"
      )
    ).toBe("24px");
  });

  async function openActiveTabStylePanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Active Tab Style/ }));
  }

  it("defaults to underline only, no color pickers shown", async () => {
    const user = userEvent.setup();
    setup([]);
    await openActiveTabStylePanel(user);

    expect(screen.getByRole("checkbox", { name: "Underline" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Text color" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Background" })).not.toBeChecked();
    expect(screen.queryByText("Active tab text color")).not.toBeInTheDocument();
    expect(screen.queryByText("Active tab background color")).not.toBeInTheDocument();
  });

  it("shows the text color picker once its toggle is on", async () => {
    const user = userEvent.setup();
    setup([], { activeTabTextColorEnabled: true });
    await openActiveTabStylePanel(user);

    expect(screen.getByText("Active tab text color")).toBeInTheDocument();
    expect(screen.queryByText("Active tab background color")).not.toBeInTheDocument();
  });

  it("shows the background color picker once its toggle is on", async () => {
    const user = userEvent.setup();
    setup([], { activeTabBackgroundEnabled: true });
    await openActiveTabStylePanel(user);

    expect(screen.getByText("Active tab background color")).toBeInTheDocument();
    expect(screen.queryByText("Active tab text color")).not.toBeInTheDocument();
  });

  it("shows both pickers alongside underline when all three are enabled at once", async () => {
    const user = userEvent.setup();
    setup([], {
      activeTabUnderline: true,
      activeTabTextColorEnabled: true,
      activeTabBackgroundEnabled: true,
    });
    await openActiveTabStylePanel(user);

    expect(screen.getByRole("checkbox", { name: "Underline" })).toBeChecked();
    expect(screen.getByText("Active tab text color")).toBeInTheDocument();
    expect(screen.getByText("Active tab background color")).toBeInTheDocument();
  });

  it("toggles activeTabUnderline independently of the color toggles", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([], { activeTabUnderline: true });
    await openActiveTabStylePanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Underline" }));

    expect(setAttributes).toHaveBeenCalledWith({ activeTabUnderline: false });
  });

  it("toggles activeTabTextColorEnabled independently", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([]);
    await openActiveTabStylePanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Text color" }));

    expect(setAttributes).toHaveBeenCalledWith({ activeTabTextColorEnabled: true });
  });

  it("toggles activeTabBackgroundEnabled independently", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([]);
    await openActiveTabStylePanel(user);

    await user.click(screen.getByRole("checkbox", { name: "Background" }));

    expect(setAttributes).toHaveBeenCalledWith({ activeTabBackgroundEnabled: true });
  });

  it("sets activeTabColor from a flat swatch on the text color picker", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([], { activeTabTextColorEnabled: true });
    await openActiveTabStylePanel(user);

    await user.click(screen.getByText("set-color-Active tab text color"));

    expect(setAttributes).toHaveBeenCalledWith({ activeTabColor: "#123456" });
  });

  it("sets activeTabColor from a gradient pick on the text color picker", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([], { activeTabTextColorEnabled: true });
    await openActiveTabStylePanel(user);

    await user.click(screen.getByText("set-gradient-Active tab text color"));

    expect(setAttributes).toHaveBeenCalledWith({
      activeTabColor: "linear-gradient(90deg,#000,#fff)",
    });
  });

  it("keeps the picked flat swatch color for the active text color, even though a swatch click also fires onGradientChange(undefined) — regression for the hover-animation-controls race", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([], { activeTabTextColorEnabled: true });
    await openActiveTabStylePanel(user);

    await user.click(screen.getByText("swatch-click-Active tab text color"));

    expect(setAttributes).toHaveBeenCalledWith({ activeTabColor: "#123456" });
    expect(setAttributes).not.toHaveBeenCalledWith({ activeTabColor: "" });
  });

  it("keeps the picked flat swatch color for the active background, even though a swatch click also fires onGradientChange(undefined) — regression for the hover-animation-controls race", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([], { activeTabBackgroundEnabled: true });
    await openActiveTabStylePanel(user);

    await user.click(screen.getByText("swatch-click-Active tab background color"));

    expect(setAttributes).toHaveBeenCalledWith({ activeTabBackgroundColor: "#123456" });
    expect(setAttributes).not.toHaveBeenCalledWith({ activeTabBackgroundColor: "" });
  });

  it("sets activeTabBackgroundColor from a gradient pick", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup([], { activeTabBackgroundEnabled: true });
    await openActiveTabStylePanel(user);

    await user.click(screen.getByText("set-gradient-Active tab background color"));

    expect(setAttributes).toHaveBeenCalledWith({
      activeTabBackgroundColor: "linear-gradient(90deg,#000,#fff)",
    });
  });

  it("starts on the first tab", () => {
    const { container } = setup(items(3));

    expect(container.querySelector(".kt-content-tabs-editor")).toHaveAttribute(
      "data-active-tab",
      "0"
    );
  });

  it("switches the active tab to whichever item contains the selected block", () => {
    mockSelectedBlockClientId.current = "item-2";
    const { container } = setup(items(3));

    expect(container.querySelector(".kt-content-tabs-editor")).toHaveAttribute(
      "data-active-tab",
      "2"
    );
  });

  it("resolves the active tab from a nested selection, e.g. a nav-link or panel block inside an item", () => {
    mockSelectedBlockClientId.current = "nav-link-in-item-1";
    mockBlockParents.current = (id) => (id === "nav-link-in-item-1" ? ["item-1"] : []);
    const { container } = setup(items(3));

    expect(container.querySelector(".kt-content-tabs-editor")).toHaveAttribute(
      "data-active-tab",
      "1"
    );
  });
});
