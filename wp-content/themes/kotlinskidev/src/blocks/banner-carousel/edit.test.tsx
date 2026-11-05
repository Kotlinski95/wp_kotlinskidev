import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MediaUploadProps {
  onSelect: (media: Array<{ id: number; url: string; alt?: string }>) => void;
  allowedTypes: string[];
  multiple?: boolean;
  gallery?: boolean;
  value: number[];
  render: (props: { open: () => void }) => React.ReactNode;
}

let lastMediaUploadProps: MediaUploadProps | null = null;
const mockOpen = jest.fn();

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    lastMediaUploadProps = props;
    return <>{props.render({ open: mockOpen })}</>;
  },
}));

interface MockCarouselPanelProps {
  settings: Record<string, unknown>;
  onChange: (partial: Record<string, unknown>) => void;
  features: Record<string, boolean>;
}

let lastCarouselPanelProps: MockCarouselPanelProps | null = null;

jest.mock("@utils/carousel/CarouselPanel", () => ({
  __esModule: true,
  default: (props: MockCarouselPanelProps) => {
    lastCarouselPanelProps = props;
    return (
      <button onClick={() => props.onChange({ showArrows: false })}>
        change-carousel-settings
      </button>
    );
  },
}));

import Edit from "./edit";

describe("banner-carousel Edit", () => {
  afterEach(() => {
    lastMediaUploadProps = null;
    lastCarouselPanelProps = null;
    jest.clearAllMocks();
  });

  it("shows Add Banners when there are no images yet", () => {
    render(<Edit attributes={{ images: [] }} setAttributes={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Add Banners" })).toBeInTheDocument();
  });

  it("shows Edit Banners once images exist", () => {
    render(<Edit attributes={{ images: [{ id: 1, url: "a.jpg" }] }} setAttributes={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Edit Banners" })).toBeInTheDocument();
  });

  it("opens the media library when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<Edit attributes={{ images: [] }} setAttributes={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add Banners" }));

    expect(mockOpen).toHaveBeenCalled();
  });

  it("allows selecting multiple images from the gallery", () => {
    render(<Edit attributes={{ images: [] }} setAttributes={jest.fn()} />);

    expect(lastMediaUploadProps?.allowedTypes).toEqual(["image"]);
    expect(lastMediaUploadProps?.multiple).toBe(true);
    expect(lastMediaUploadProps?.gallery).toBe(true);
  });

  it("maps selected media to id/url/alt and updates the images attribute", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{ images: [] }} setAttributes={setAttributes} />);

    lastMediaUploadProps?.onSelect([
      { id: 1, url: "a.jpg", alt: "A" },
      { id: 2, url: "b.jpg" },
    ]);

    expect(setAttributes).toHaveBeenCalledWith({
      images: [
        { id: 1, url: "a.jpg", alt: "A" },
        { id: 2, url: "b.jpg", alt: undefined },
      ],
    });
  });

  it("renders a preview slide for each selected image", () => {
    const { container } = render(
      <Edit
        attributes={{ images: [{ id: 1, url: "a.jpg", alt: "First" }] }}
        setAttributes={jest.fn()}
      />
    );

    const img = container.querySelector(".swiper-slide img");
    expect(img).toHaveAttribute("src", "a.jpg");
    expect(img).toHaveAttribute("alt", "First");
  });

  it("passes the carousel settings (excluding images) to the settings panel", () => {
    render(
      <Edit
        attributes={{ images: [], showArrows: false, autoplay: true }}
        setAttributes={jest.fn()}
      />
    );

    expect(lastCarouselPanelProps?.settings).toEqual({ showArrows: false, autoplay: true });
  });

  it("enables the full feature set on the carousel settings panel", () => {
    render(<Edit attributes={{ images: [] }} setAttributes={jest.fn()} />);

    expect(lastCarouselPanelProps?.features).toEqual({
      slidesPerBreakpoint: true,
      scrollbar: true,
      autoplay: true,
      arrowsPosition: true,
      navColor: true,
      navPlacement: true,
      transitionEffect: true,
    });
  });

  it("forwards carousel settings changes to setAttributes", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={{ images: [] }} setAttributes={setAttributes} />);

    await user.click(screen.getByRole("button", { name: "change-carousel-settings" }));

    expect(setAttributes).toHaveBeenCalledWith({ showArrows: false });
  });
});
