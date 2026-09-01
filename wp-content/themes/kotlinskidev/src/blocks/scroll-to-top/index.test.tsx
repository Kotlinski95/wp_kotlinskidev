import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  allowedTypes: string[];
  render: (props: { open: () => void }) => React.ReactNode;
}

let lastMediaUploadProps: MediaUploadProps | null = null;

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    lastMediaUploadProps = props;
    return <>{props.render({ open: jest.fn() })}</>;
  },
}));

import "./index";

function getEditComponent() {
  return (registerBlockType as jest.Mock).mock.calls[0][1].edit;
}

describe("kotlinskidev/scroll-to-top", () => {
  it("registers the block under the kotlinskidev/scroll-to-top name", () => {
    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/scroll-to-top",
      expect.objectContaining({ title: "Scroll To Top", category: "kotlinskidev" })
    );
  });

  it("declares a fixed-variant default and no label attribute", () => {
    const { attributes } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(attributes.variant).toEqual({ type: "string", default: "fixed" });
    expect(attributes.label).toBeUndefined();
  });

  it("renders an editor placeholder describing the fixed frontend button by default", () => {
    const Edit = getEditComponent();

    render(<Edit attributes={{ variant: "fixed" }} setAttributes={jest.fn()} />);

    expect(screen.getByText("Scroll To Top")).toBeInTheDocument();
    expect(
      screen.getByText("Fixed button, visible on the frontend while scrolling")
    ).toBeInTheDocument();
  });

  it("renders a bar-variant hint describing the always-visible inline bar", () => {
    const Edit = getEditComponent();

    render(<Edit attributes={{ variant: "bar" }} setAttributes={jest.fn()} />);

    expect(
      screen.getByText("Full-width bar, always visible where placed — e.g. above the footer")
    ).toBeInTheDocument();
  });

  it("shows a disabled label field pointing to Polylang string translations", () => {
    const Edit = getEditComponent();

    render(<Edit attributes={{ variant: "bar" }} setAttributes={jest.fn()} />);

    const labelField = screen.getByLabelText("Button Label") as HTMLInputElement;
    expect(labelField).toBeDisabled();
    expect(labelField.value).toBe("Scroll to Top");
    expect(
      screen.getByText(/Managed via Polylang.*Scroll To Top Button Label/)
    ).toBeInTheDocument();
  });

  it("updates the variant attribute when the Select control changes", async () => {
    const Edit = getEditComponent();
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(<Edit attributes={{ variant: "fixed" }} setAttributes={setAttributes} />);

    await user.selectOptions(screen.getByLabelText("Variant"), "bar");

    expect(setAttributes).toHaveBeenCalledWith({ variant: "bar" });
  });

  it("declares the arrow-icon attributes with their defaults", () => {
    const { attributes } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(attributes.showArrow).toEqual({ type: "boolean", default: false });
    expect(attributes.arrowIconId).toEqual({ type: "number", default: 0 });
    expect(attributes.arrowIconUrl).toEqual({ type: "string", default: "" });
    expect(attributes.arrowSize).toEqual({ type: "number", default: 16 });
  });

  it("shows a note instead of arrow controls for the fixed variant", async () => {
    const Edit = getEditComponent();
    const user = userEvent.setup();

    render(<Edit attributes={{ variant: "fixed" }} setAttributes={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: /Arrow Icon/ }));

    expect(
      screen.getByText(/The arrow only applies to the Full-Width Bar variant/)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: /Show arrow after label/ })
    ).not.toBeInTheDocument();
  });

  it("shows the show-arrow toggle for the bar variant, off by default with no picker/size control", async () => {
    const Edit = getEditComponent();
    const user = userEvent.setup();

    render(<Edit attributes={{ variant: "bar", showArrow: false }} setAttributes={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: /Arrow Icon/ }));

    expect(screen.getByRole("checkbox", { name: /Show arrow after label/ })).not.toBeChecked();
    expect(screen.queryByRole("button", { name: "Select SVG icon" })).not.toBeInTheDocument();
    expect(screen.queryByRole("slider", { name: "Arrow size" })).not.toBeInTheDocument();
  });

  it("reveals the icon picker and size control once the arrow toggle is on", async () => {
    const Edit = getEditComponent();
    const user = userEvent.setup();

    render(
      <Edit
        attributes={{ variant: "bar", showArrow: true, arrowSize: 16 }}
        setAttributes={jest.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: /Arrow Icon/ }));

    expect(screen.getByRole("button", { name: "Select SVG icon" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Arrow size" })).toHaveValue("16");
  });

  it("turns the arrow on via the toggle", async () => {
    const Edit = getEditComponent();
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(
      <Edit attributes={{ variant: "bar", showArrow: false }} setAttributes={setAttributes} />
    );
    await user.click(screen.getByRole("button", { name: /Arrow Icon/ }));
    await user.click(screen.getByRole("checkbox", { name: /Show arrow after label/ }));

    expect(setAttributes).toHaveBeenCalledWith({ showArrow: true });
  });

  it("sets the arrow icon id/url when one is picked", async () => {
    const Edit = getEditComponent();
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(<Edit attributes={{ variant: "bar", showArrow: true }} setAttributes={setAttributes} />);
    await user.click(screen.getByRole("button", { name: /Arrow Icon/ }));

    lastMediaUploadProps?.onSelect({ id: 9, url: "arrow.svg" });

    expect(setAttributes).toHaveBeenCalledWith({ arrowIconId: 9, arrowIconUrl: "arrow.svg" });
  });

  it("saves nothing, since the block is rendered on the frontend via PHP", () => {
    const { save } = (registerBlockType as jest.Mock).mock.calls[0][1];

    expect(save()).toBeNull();
  });
});
