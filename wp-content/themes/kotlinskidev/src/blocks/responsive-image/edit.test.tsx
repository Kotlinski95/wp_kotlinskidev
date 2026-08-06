import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

let mockMediaUploadCalls: MediaUploadProps[] = [];
const mockOpens = [jest.fn(), jest.fn()];

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    const index = mockMediaUploadCalls.length;
    mockMediaUploadCalls.push(props);
    return <>{props.render({ open: mockOpens[index] })}</>;
  },
}));

import Edit from "./edit";

function getSection(container: HTMLElement, heading: string) {
  const strong = within(container).getByText(heading);
  return strong.closest("div") as HTMLElement;
}

describe("responsive-image Edit", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.forEach((fn) => fn.mockClear());
  });

  it("shows Select Image for both desktop and mobile when nothing is chosen yet", () => {
    const { container } = render(<Edit attributes={{}} setAttributes={jest.fn()} />);

    const desktop = getSection(container, "Desktop Image");
    const mobile = getSection(container, "Mobile Image (optional)");
    expect(within(desktop).getByRole("button", { name: "Select Image" })).toBeInTheDocument();
    expect(within(mobile).getByRole("button", { name: "Select Image" })).toBeInTheDocument();
  });

  it("shows Replace Image and a preview once a desktop image is chosen", () => {
    const { container } = render(
      <Edit attributes={{ desktopImageUrl: "desktop.jpg" }} setAttributes={jest.fn()} />
    );

    const desktop = getSection(container, "Desktop Image");
    expect(within(desktop).getByRole("button", { name: "Replace Image" })).toBeInTheDocument();
    expect(desktop.querySelector("img")).toHaveAttribute("src", "desktop.jpg");
  });

  it("shows Replace Image and a preview once a mobile image is chosen", () => {
    const { container } = render(
      <Edit attributes={{ mobileImageUrl: "mobile.jpg" }} setAttributes={jest.fn()} />
    );

    const mobile = getSection(container, "Mobile Image (optional)");
    expect(within(mobile).getByRole("button", { name: "Replace Image" })).toBeInTheDocument();
    expect(mobile.querySelector("img")).toHaveAttribute("src", "mobile.jpg");
  });

  it("opens the media library for the desktop button independently of the mobile one", async () => {
    const user = userEvent.setup();
    const { container } = render(<Edit attributes={{}} setAttributes={jest.fn()} />);

    const desktop = getSection(container, "Desktop Image");
    await user.click(within(desktop).getByRole("button", { name: "Select Image" }));

    expect(mockOpens[0]).toHaveBeenCalled();
    expect(mockOpens[1]).not.toHaveBeenCalled();
  });

  it("sets desktopImageUrl/Id when a desktop image is selected", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{}} setAttributes={setAttributes} />);

    mockMediaUploadCalls[0].onSelect({ id: 1, url: "desktop.jpg" });

    expect(setAttributes).toHaveBeenCalledWith({
      desktopImageUrl: "desktop.jpg",
      desktopImageId: 1,
    });
  });

  it("sets mobileImageUrl/Id when a mobile image is selected", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{}} setAttributes={setAttributes} />);

    mockMediaUploadCalls[1].onSelect({ id: 2, url: "mobile.jpg" });

    expect(setAttributes).toHaveBeenCalledWith({ mobileImageUrl: "mobile.jpg", mobileImageId: 2 });
  });

  it("updates the alt text", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={{}} setAttributes={setAttributes} />);

    await user.type(screen.getByLabelText("Alt Text"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ alt: "X" });
  });

  it("defaults the breakpoint to 767 and updates it via the range control", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{}} setAttributes={setAttributes} />);

    const range = screen.getByRole("slider", { name: "Mobile Breakpoint (px)" });
    expect(range).toHaveValue("767");
  });

  it("defaults loading to lazy and updates it via the select control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={{}} setAttributes={setAttributes} />);

    expect(screen.getByRole("combobox", { name: "Image Loading" })).toHaveValue("lazy");

    await user.selectOptions(screen.getByRole("combobox", { name: "Image Loading" }), "eager");

    expect(setAttributes).toHaveBeenCalledWith({ loading: "eager" });
  });
});
