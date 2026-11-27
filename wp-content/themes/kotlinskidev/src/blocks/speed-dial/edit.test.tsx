import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

interface InnerBlocksOptions {
  allowedBlocks: string[];
  template: [string, { action: string }][];
  orientation: string;
}

const mockInnerBlocksOptions: { current: InnerBlocksOptions | null } = { current: null };
const mockItems: { current: { attributes: { action: string } }[] } = { current: [] };

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  useInnerBlocksProps: (props: Record<string, unknown>, options: InnerBlocksOptions) => {
    mockInnerBlocksOptions.current = options;
    return { ...props, "data-testid": "inner-blocks" };
  },
  ButtonBlockAppender: () => null,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  __experimentalPanelColorGradientSettings: ({
    settings,
  }: {
    settings: { label: string; onColorChange: (value?: string) => void }[];
  }) => (
    <div>
      {settings.map((setting) => (
        <button key={setting.label} onClick={() => setting.onColorChange("#123456")}>
          set-{setting.label}
        </button>
      ))}
    </div>
  ),
}));

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    actions: {},
    selectors: {
      getBlock: () => ({ innerBlocks: mockItems.current }),
    },
  })
);

jest.mock("../shared/nav-icon-picker", () => ({
  NavIconPicker: () => <div data-testid="nav-icon-picker" />,
}));

import Edit, { type SpeedDialAttributes } from "./edit";

function baseAttributes(): SpeedDialAttributes {
  return {
    label: "",
    position: { desktop: "bottom-right", tablet: "bottom-right", mobile: "bottom-right" },
    offset: {
      desktop: { x: 1, y: 1 },
      tablet: { x: 1, y: 1 },
      mobile: { x: 1, y: 1 },
    },
    direction: "auto",
    labels: "auto",
    motion: "scale",
    zIndex: 999,
    closeOnAction: true,
    avoidMobileNav: true,
    toggleSize: 3.5,
    itemSize: 3,
    toggleIcon: "plus",
    toggleIconId: 0,
    toggleIconUrl: "",
    toggleBackgroundColor: "",
    toggleTextColor: "",
    itemBackgroundColor: "",
    itemTextColor: "",
  };
}

function setup(attributes: Partial<SpeedDialAttributes> = {}) {
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

describe("speed-dial Edit", () => {
  beforeEach(() => {
    mockItems.current = [];
    mockInnerBlocksOptions.current = null;
  });

  it("restricts inner blocks to the item block with the phone, email, accessibility template", () => {
    setup();

    expect(screen.getByTestId("inner-blocks")).toHaveClass("kt-speed-dial");
    expect(mockInnerBlocksOptions.current?.allowedBlocks).toEqual(["kotlinskidev/speed-dial-item"]);
    expect(mockInnerBlocksOptions.current?.orientation).toBe("vertical");
    expect(mockInnerBlocksOptions.current?.template.map(([, attrs]) => attrs.action)).toEqual([
      "phone",
      "email",
      "accessibility",
    ]);
  });

  it("updates only the chosen device position", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup();

    const positions = screen.getAllByRole("combobox", { name: "Position" });
    await user.selectOptions(positions[2], "top-left");

    expect(setAttributes).toHaveBeenCalledWith({
      position: { desktop: "bottom-right", tablet: "bottom-right", mobile: "top-left" },
    });
  });

  it("updates the open direction and label visibility", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup();
    await user.click(screen.getByRole("button", { name: "Behaviour" }));

    await user.selectOptions(screen.getByRole("combobox", { name: "Open direction" }), "left");
    await user.selectOptions(screen.getByRole("combobox", { name: "Label visibility" }), "always");

    expect(setAttributes).toHaveBeenCalledWith({ direction: "left" });
    expect(setAttributes).toHaveBeenCalledWith({ labels: "always" });
  });

  it("caps the z-index at the plugin token minus 1000", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup();
    await user.click(screen.getByRole("button", { name: "Behaviour" }));

    const input = screen.getByRole("spinbutton", { name: "Z-index" });
    await user.clear(input);
    await user.type(input, "2147483647");
    await user.tab();

    expect(setAttributes).toHaveBeenLastCalledWith({ zIndex: 2147482999 });
  });

  it("writes the toggle and item sizes", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup();
    await user.click(screen.getByRole("button", { name: "Size" }));

    const [toggleInput] = screen.getAllByRole("spinbutton", { name: "Toggle button size (rem)" });
    await user.clear(toggleInput);
    await user.type(toggleInput, "2.5");
    await user.tab();

    expect(setAttributes).toHaveBeenLastCalledWith({ toggleSize: 2.5 });
    expect(screen.getAllByRole("slider", { name: "Item button size (rem)" })).toHaveLength(1);
  });

  it("writes colour changes to the matching attribute", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup();

    await user.click(screen.getByRole("button", { name: "set-Toggle background" }));

    expect(setAttributes).toHaveBeenCalledWith({ toggleBackgroundColor: "#123456" });
  });

  it("shows the launcher notice only when an accessibility or trigger item exists", async () => {
    const user = userEvent.setup();
    const { unmount } = setup();
    expect(screen.queryByText(/launcher mode to hidden/)).not.toBeInTheDocument();
    unmount();

    mockItems.current = [{ attributes: { action: "trigger" } }];
    setup();
    await user.click(screen.getByRole("button", { name: "Accessibility plugin" }));

    expect(screen.getAllByText(/launcher mode to hidden/).length).toBeGreaterThan(0);
  });
});
