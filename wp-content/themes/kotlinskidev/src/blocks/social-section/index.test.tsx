import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: Object.assign(
    ({ allowedBlocks, template }: { allowedBlocks: string[]; template: unknown[] }) => (
      <div
        data-testid="inner-blocks"
        data-allowed={allowedBlocks.join(",")}
        data-template-length={template.length}
      />
    ),
    { Content: () => <div data-testid="inner-blocks-content" /> }
  ),
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    const open = jest.fn();
    (globalThis as { __mediaUpload?: MediaUploadProps }).__mediaUpload = props;
    return <>{props.render({ open })}</>;
  },
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

function getDefinition(name: string) {
  const call = (registerBlockType as jest.Mock).mock.calls.find((c) => c[0] === name);
  return call?.[1];
}

function deviceSection(device: string) {
  return screen.getByText(device).closest("div") as HTMLElement;
}

describe("social-section / social-item registration", () => {
  it("registers social-section with responsive object attributes", () => {
    const definition = getDefinition("kotlinskidev/social-section");

    expect(definition.attributes.attachToBottom).toEqual({ type: "boolean", default: true });
    expect(definition.attributes.iconWidth).toEqual({ type: "object", default: {} });
    expect(definition.attributes.iconHeight).toEqual({ type: "object", default: {} });
    expect(definition.attributes.itemGap).toEqual({ type: "object", default: {} });
  });

  it("saves social-section by rendering InnerBlocks.Content", () => {
    const { save: Save } = getDefinition("kotlinskidev/social-section");

    render(<Save />);

    expect(screen.getByTestId("inner-blocks-content")).toBeInTheDocument();
  });

  it("registers social-item with a null save", () => {
    const definition = getDefinition("kotlinskidev/social-item");

    expect(definition.attributes.label).toEqual({ type: "string", default: "" });
    expect(definition.attributes.navIconId).toEqual({ type: "integer", default: 0 });
    expect(definition.save()).toBeNull();
  });
});

describe("SocialSectionEdit", () => {
  function getEdit() {
    return getDefinition("kotlinskidev/social-section").edit;
  }

  function baseAttributes() {
    return { attachToBottom: true, iconWidth: {}, iconHeight: {}, itemGap: {} };
  }

  function renderEdit(overrides: Partial<ReturnType<typeof baseAttributes>> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("toggles attach to bottom", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Attach to bottom" }));

    expect(setAttributes).toHaveBeenCalledWith({ attachToBottom: false });
  });

  it("passes allowed blocks and template into InnerBlocks", () => {
    renderEdit();

    const innerBlocks = screen.getByTestId("inner-blocks");
    expect(innerBlocks).toHaveAttribute("data-allowed", "kotlinskidev/social-item");
    expect(innerBlocks).toHaveAttribute("data-template-length", "1");
  });

  it("keeps the Icon Size & Spacing panel collapsed by default", () => {
    renderEdit();

    expect(screen.queryByLabelText("Icon Width")).not.toBeInTheDocument();
  });

  it("lists a section per responsive device once expanded", async () => {
    const user = userEvent.setup();
    renderEdit();
    await user.click(screen.getByRole("button", { name: "Icon Size & Spacing" }));

    expect(screen.getByText("desktop")).toBeInTheDocument();
    expect(screen.getByText("tablet")).toBeInTheDocument();
    expect(screen.getByText("mobile")).toBeInTheDocument();
  });

  it("updates only the changed device's icon width, preserving the others", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ iconWidth: { desktop: "24px", mobile: "16px" } });
    await user.click(screen.getByRole("button", { name: "Icon Size & Spacing" }));

    const tabletInput = within(deviceSection("tablet")).getByLabelText("Icon Width");
    fireEvent.change(tabletInput, { target: { value: "20px" } });

    expect(setAttributes).toHaveBeenLastCalledWith({
      iconWidth: { desktop: "24px", mobile: "16px", tablet: "20px" },
    });
  });

  it("clears a device's icon height to undefined when emptied", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ iconHeight: { desktop: "24px" } });
    await user.click(screen.getByRole("button", { name: "Icon Size & Spacing" }));

    const desktopInput = within(deviceSection("desktop")).getByLabelText("Icon Height");
    await user.clear(desktopInput);

    expect(setAttributes).toHaveBeenLastCalledWith({ iconHeight: { desktop: undefined } });
  });

  it("updates the item gap for a device", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();
    await user.click(screen.getByRole("button", { name: "Icon Size & Spacing" }));

    const mobileGap = within(deviceSection("mobile")).getByLabelText("Gap Between Icons");
    await user.type(mobileGap, "1rem");

    expect(setAttributes).toHaveBeenCalledWith({ itemGap: { mobile: "1" } });
  });
});

describe("SocialItemEdit", () => {
  function getEdit() {
    return getDefinition("kotlinskidev/social-item").edit;
  }

  function baseAttributes() {
    return { label: "", url: "", iconClass: "", navIconId: 0, navIconUrl: "" };
  }

  function renderEdit(overrides: Partial<ReturnType<typeof baseAttributes>> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("updates the label", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Label"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ label: "X" });
  });

  it("updates the URL", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("URL"), "h");

    expect(setAttributes).toHaveBeenCalledWith({ url: "h" });
  });

  it("updates the icon class", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Icon class"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ iconClass: "X" });
  });

  it("shows Select SVG icon and no remove button when no icon is set", () => {
    renderEdit();

    expect(screen.getByRole("button", { name: "Select SVG icon" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove icon" })).not.toBeInTheDocument();
  });

  it("shows Replace SVG icon and a remove button once an icon is set", () => {
    renderEdit({ navIconId: 5, navIconUrl: "icon.svg" });

    expect(screen.getByRole("button", { name: "Replace SVG icon" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove icon" })).toBeInTheDocument();
  });

  it("sets navIconId/Url when an icon is selected", () => {
    const { setAttributes } = renderEdit();

    const upload = (globalThis as { __mediaUpload?: MediaUploadProps }).__mediaUpload;
    upload?.onSelect({ id: 3, url: "chosen.svg" });

    expect(setAttributes).toHaveBeenCalledWith({ navIconId: 3, navIconUrl: "chosen.svg" });
  });

  it("clears the icon when Remove icon is clicked", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ navIconId: 5, navIconUrl: "icon.svg" });

    await user.click(screen.getByRole("button", { name: "Remove icon" }));

    expect(setAttributes).toHaveBeenCalledWith({ navIconId: 0, navIconUrl: "" });
  });

  it("shows a fallback label span when there is no icon", () => {
    const { container } = renderEdit({ label: "Facebook" });

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
  });

  it("falls back to 'Social link' when the label is empty and there is no icon", () => {
    renderEdit({ label: "" });

    expect(screen.getByText("Social link")).toBeInTheDocument();
  });

  it("renders the icon image with the label as alt text once an icon is set", () => {
    const { container } = renderEdit({ label: "Facebook", navIconUrl: "icon.svg" });

    expect(container.querySelector("img")).toHaveAttribute("alt", "Facebook");
    expect(screen.queryByText("Facebook")).not.toBeInTheDocument();
  });
});
