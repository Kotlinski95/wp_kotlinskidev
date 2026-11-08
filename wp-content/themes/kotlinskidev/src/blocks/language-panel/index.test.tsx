import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: Object.assign(
    ({ template }: { template: unknown[] }) => (
      <div data-testid="inner-blocks" data-template-length={template.length} />
    ),
    { Content: () => <div data-testid="inner-blocks-content" /> }
  ),
}));

interface NavIconPickerProps {
  iconId: number;
  iconUrl: string;
  onChange: (id: number, url: string) => void;
}

jest.mock("../shared/nav-icon-picker", () => ({
  NavIconPicker: (props: NavIconPickerProps) => (
    <button onClick={() => props.onChange(9, "new-icon.svg")}>pick-icon</button>
  ),
}));

import "./index";

function getDefinition() {
  return (registerBlockType as jest.Mock).mock.calls[0][1];
}

function baseAttributes() {
  return {
    label: "",
    labelStyle: "short",
    showFlag: false,
    visibility: "all",
    navIconId: 0,
    navIconUrl: "",
    showIndicator: false,
    indicatorIconId: 0,
    indicatorIconUrl: "",
    indicatorEffect: "rotate",
  };
}

function panelFor(title: string) {
  return screen
    .getByRole("button", { name: title })
    .closest(".components-panel__body") as HTMLElement;
}

describe("language-panel registration", () => {
  it("registers both language-panel and nav-language-panel with the same edit/save", () => {
    const { edit, save } = getDefinition();

    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/language-panel" }),
      expect.objectContaining({ edit, save })
    );
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/nav-language-panel" }),
      expect.objectContaining({ edit, save })
    );
  });

  it("saves by rendering InnerBlocks.Content", () => {
    const { save: Save } = getDefinition();

    render(<Save />);

    expect(screen.getByTestId("inner-blocks-content")).toBeInTheDocument();
  });
});

describe("LanguagePanelEdit", () => {
  function getEdit() {
    return getDefinition().edit;
  }

  function renderEdit(overrides: Partial<ReturnType<typeof baseAttributes>> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("starts collapsed, hiding the inner language-switcher block", () => {
    const { container } = renderEdit();

    const trigger = container.querySelector(".kt-search-panel-editor__trigger");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("inner-blocks").parentElement).toHaveAttribute("hidden");
  });

  it("expands to reveal the inner language-switcher block on trigger click", async () => {
    const user = userEvent.setup();
    const { container } = renderEdit();
    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("inner-blocks").parentElement).not.toHaveAttribute("hidden");
  });

  it("shows the fallback globe icon when no nav icon is set", () => {
    const { container } = renderEdit();

    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    expect(trigger.querySelector("svg")).not.toBeNull();
    expect(trigger.querySelector("img")).toBeNull();
  });

  it("shows the selected nav icon image instead of the fallback icon", () => {
    const { container } = renderEdit({ navIconUrl: "icon.svg" });

    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    expect(trigger.querySelector('img[src="icon.svg"]')).not.toBeNull();
    expect(trigger.querySelector("svg")).toBeNull();
  });

  it("shows the configured label, falling back to Language", () => {
    const { rerender } = render(
      React.createElement(getEdit(), { attributes: baseAttributes(), setAttributes: jest.fn() })
    );
    expect(screen.getByText("Language")).toBeInTheDocument();

    const Edit = getEdit();
    rerender(
      <Edit attributes={{ ...baseAttributes(), label: "Lang" }} setAttributes={jest.fn()} />
    );
    expect(screen.getByText("Lang")).toBeInTheDocument();
  });

  it("updates the nav label", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Nav label"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ label: "X" });
  });

  it("updates the auto label style", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.selectOptions(screen.getByRole("combobox", { name: "Auto label style" }), "full");

    expect(setAttributes).toHaveBeenCalledWith({ labelStyle: "full" });
  });

  it("toggles the current-language flag", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Show current language flag" }));

    expect(setAttributes).toHaveBeenCalledWith({ showFlag: true });
  });

  it("updates the nav icon via the Nav Icon panel's picker", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(within(panelFor("Nav Icon")).getByRole("button", { name: "pick-icon" }));

    expect(setAttributes).toHaveBeenCalledWith({ navIconId: 9, navIconUrl: "new-icon.svg" });
  });

  it("hides indicator effect and icon controls until the indicator is enabled", () => {
    renderEdit();

    expect(screen.queryByRole("combobox", { name: "Open effect" })).not.toBeInTheDocument();
    expect(
      within(panelFor("Dropdown Indicator")).queryByRole("button", { name: "pick-icon" })
    ).not.toBeInTheDocument();
  });

  it("toggles the indicator arrow", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Show indicator arrow" }));

    expect(setAttributes).toHaveBeenCalledWith({ showIndicator: true });
  });

  it("shows and wires the indicator effect and icon controls once the indicator is enabled", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ showIndicator: true });

    await user.selectOptions(screen.getByRole("combobox", { name: "Open effect" }), "none");
    expect(setAttributes).toHaveBeenLastCalledWith({ indicatorEffect: "none" });

    await user.click(
      within(panelFor("Dropdown Indicator")).getByRole("button", { name: "pick-icon" })
    );
    expect(setAttributes).toHaveBeenLastCalledWith({
      indicatorIconId: 9,
      indicatorIconUrl: "new-icon.svg",
    });
  });

  it("does not render an indicator icon in the trigger when the indicator is disabled", () => {
    const { container } = renderEdit({ showIndicator: false });

    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    expect(trigger.querySelectorAll("svg")).toHaveLength(1);
  });

  it("renders a chevron icon in the trigger when the indicator is enabled with no custom icon", () => {
    const { container } = renderEdit({ showIndicator: true, indicatorIconUrl: "" });

    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    expect(trigger.querySelectorAll("svg")).toHaveLength(2);
  });

  it("renders a masked span instead of the chevron once a custom indicator icon is set", () => {
    const { container } = renderEdit({ showIndicator: true, indicatorIconUrl: "arrow.svg" });

    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    expect(trigger.querySelectorAll("svg")).toHaveLength(1);
    expect(trigger.querySelector("span[aria-hidden]")).not.toBeNull();
  });
});
