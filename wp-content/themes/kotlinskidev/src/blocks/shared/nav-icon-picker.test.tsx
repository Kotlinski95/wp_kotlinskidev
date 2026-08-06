import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  allowedTypes: string[];
  render: (props: { open: () => void }) => React.ReactNode;
}

let lastMediaUploadProps: MediaUploadProps | null = null;
const mockOpen = jest.fn();

jest.mock("@wordpress/block-editor", () => ({
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    lastMediaUploadProps = props;
    return <>{props.render({ open: mockOpen })}</>;
  },
}));

import { NavIconPicker } from "./nav-icon-picker";

describe("NavIconPicker", () => {
  afterEach(() => {
    lastMediaUploadProps = null;
    jest.clearAllMocks();
  });

  it("shows a primary select button and no preview when there is no icon", () => {
    render(<NavIconPicker iconId={0} iconUrl="" onChange={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Select SVG icon" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove icon" })).not.toBeInTheDocument();
  });

  it("shows the icon preview, replace button, and remove button when an icon is set", () => {
    const { container } = render(
      <NavIconPicker iconId={5} iconUrl="icon.svg" onChange={jest.fn()} />
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "icon.svg");
    expect(screen.getByRole("button", { name: "Replace icon" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove icon" })).toBeInTheDocument();
  });

  it("restricts uploads to SVG files", () => {
    render(<NavIconPicker iconId={0} iconUrl="" onChange={jest.fn()} />);

    expect(lastMediaUploadProps?.allowedTypes).toEqual(["image/svg+xml"]);
  });

  it("opens the media library when the select button is clicked", async () => {
    const user = userEvent.setup();
    render(<NavIconPicker iconId={0} iconUrl="" onChange={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Select SVG icon" }));

    expect(mockOpen).toHaveBeenCalled();
  });

  it("calls onChange with the selected media's id and url", () => {
    const onChange = jest.fn();
    render(<NavIconPicker iconId={0} iconUrl="" onChange={onChange} />);

    lastMediaUploadProps?.onSelect({ id: 9, url: "new-icon.svg" });

    expect(onChange).toHaveBeenCalledWith(9, "new-icon.svg");
  });

  it("calls onChange with an empty selection when the icon is removed", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<NavIconPicker iconId={5} iconUrl="icon.svg" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Remove icon" }));

    expect(onChange).toHaveBeenCalledWith(0, "");
  });
});
