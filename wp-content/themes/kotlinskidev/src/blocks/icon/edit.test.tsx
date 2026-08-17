import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

let mockMediaUploadCalls: MediaUploadProps[] = [];
const mockOpen = jest.fn();

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    mockMediaUploadCalls.push(props);
    return <>{props.render({ open: mockOpen })}</>;
  },
}));

import Edit from "./edit";

describe("icon Edit", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpen.mockClear();
  });

  const baseAttributes = {
    mediaId: 0,
    mediaUrl: "",
    size: "",
    color: "",
    ariaLabel: "",
    showTooltip: false,
  };

  it("shows a Select SVG icon button when nothing is chosen", () => {
    render(<Edit attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Select SVG icon" })).toBeInTheDocument();
  });

  it("shows a Replace icon button and preview once an icon is chosen", () => {
    render(
      <Edit
        attributes={{ ...baseAttributes, mediaId: 3, mediaUrl: "https://example.test/star.svg" }}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Replace icon" })).toBeInTheDocument();
  });

  it("calls setAttributes with the selected icon id and url", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    mockMediaUploadCalls[0].onSelect({ id: 4, url: "https://example.test/heart.svg" });

    expect(setAttributes).toHaveBeenCalledWith({
      mediaId: 4,
      mediaUrl: "https://example.test/heart.svg",
    });
  });

  it("updates size via the text control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    await user.type(screen.getByLabelText("Size"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ size: "X" });
  });

  it("updates color via the text control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    await user.type(screen.getByLabelText("Color"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ color: "X" });
  });

  it("updates the accessible label via the text control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    await user.type(screen.getByLabelText("Accessible label"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ ariaLabel: "X" });
  });

  it("shows a decorative-icon notice when no accessible label is set", () => {
    const { container } = render(<Edit attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(container.querySelector(".components-notice")?.textContent).toContain(
      "hidden from screen readers as decorative"
    );
  });

  it("does not show the decorative-icon notice once an accessible label is set", () => {
    const { container } = render(
      <Edit
        attributes={{ ...baseAttributes, ariaLabel: "Star rating" }}
        setAttributes={jest.fn()}
      />
    );

    expect(container.querySelector(".components-notice")).not.toBeInTheDocument();
  });

  it("hides the tooltip toggle when no accessible label is set", () => {
    render(<Edit attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(screen.queryByLabelText("Show tooltip on hover")).not.toBeInTheDocument();
  });

  it("shows and toggles the tooltip control once an accessible label is set", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(
      <Edit
        attributes={{ ...baseAttributes, ariaLabel: "Star rating" }}
        setAttributes={setAttributes}
      />
    );

    await user.click(screen.getByLabelText("Show tooltip on hover"));

    expect(setAttributes).toHaveBeenCalledWith({ showTooltip: true });
  });
});
