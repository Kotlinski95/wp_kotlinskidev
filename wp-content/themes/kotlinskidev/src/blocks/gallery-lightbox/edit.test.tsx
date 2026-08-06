import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface WPMediaItem {
  id: number;
  url: string;
  mime?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  image?: { src: string };
  sizes?: { medium?: { url: string }; large?: { url: string } };
}

interface MediaUploadProps {
  onSelect: (media: WPMediaItem | WPMediaItem[]) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

let mockMediaUploadCalls: MediaUploadProps[] = [];
const mockOpens: jest.Mock[] = [];

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown> = {}) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    const idx = mockMediaUploadCalls.length;
    mockMediaUploadCalls.push(props);
    if (!mockOpens[idx]) {
      mockOpens[idx] = jest.fn();
    }
    return <>{props.render({ open: mockOpens[idx] })}</>;
  },
}));

interface MockCarouselPanelProps {
  settings: Record<string, unknown>;
  onChange: (partial: Record<string, unknown>) => void;
  title?: string;
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

function mediaPanel() {
  return screen
    .getByRole("button", { name: "Media" })
    .closest(".components-panel__body") as HTMLElement;
}

function image(id: number, overrides: Partial<WPMediaItem> = {}): WPMediaItem {
  return { id, url: `img-${id}.jpg`, mime: "image/jpeg", ...overrides };
}

function galleryImage(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    url: `img-${id}.jpg`,
    thumbnailUrl: `img-${id}.jpg`,
    alt: "",
    caption: "",
    type: "image" as const,
    poster: "",
    width: 0,
    height: 0,
    ...overrides,
  };
}

function baseAttributes(overrides: Record<string, unknown> = {}) {
  return {
    images: [],
    videoControls: true,
    videoAutoplay: false,
    videoLoop: false,
    videoMuted: false,
    useMobileMedia: false,
    mobileImages: [],
    lockHeight: false,
    ...overrides,
  };
}

function renderEdit(overrides: Record<string, unknown> = {}) {
  const setAttributes = jest.fn();
  const utils = render(
    <Edit attributes={baseAttributes(overrides) as never} setAttributes={setAttributes} />
  );
  return { ...utils, setAttributes };
}

describe("gallery-lightbox Edit — canvas preview", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.length = 0;
    lastCarouselPanelProps = null;
  });

  it("shows an empty-state add button on the canvas when there are no images", () => {
    const { container } = renderEdit();

    const empty = container.querySelector(".gallery-lightbox-editor--empty") as HTMLElement;
    expect(within(empty).getByRole("button", { name: "Add Images & Videos" })).toBeInTheDocument();
  });

  it("renders the first image as the trigger preview", () => {
    const { container } = renderEdit({ images: [galleryImage(1, { alt: "First" })] });

    const img = container.querySelector(".gallery-lightbox-trigger img");
    expect(img).toHaveAttribute("src", "img-1.jpg");
    expect(img).toHaveAttribute("alt", "First");
    expect(container.querySelector(".gallery-lightbox-video-badge")).toBeNull();
  });

  it("shows the video badge and poster when the first item is a video", () => {
    const { container } = renderEdit({
      images: [galleryImage(1, { type: "video", url: "v.mp4", poster: "poster.jpg" })],
    });

    const img = container.querySelector(".gallery-lightbox-trigger img");
    expect(img).toHaveAttribute("src", "poster.jpg");
    expect(container.querySelector(".gallery-lightbox-video-badge")).not.toBeNull();
  });

  it("shows a remaining-count badge once there is more than one image", () => {
    const { container } = renderEdit({
      images: [galleryImage(1), galleryImage(2), galleryImage(3)],
    });

    expect(container.querySelector(".gallery-lightbox-count")).toHaveTextContent("+2");
  });

  it("hides the count badge for a single image", () => {
    const { container } = renderEdit({ images: [galleryImage(1)] });

    expect(container.querySelector(".gallery-lightbox-count")).toBeNull();
  });
});

describe("gallery-lightbox Edit — media selection", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.length = 0;
    lastCarouselPanelProps = null;
  });

  it("maps a single selected image into the images attribute", () => {
    const { setAttributes } = renderEdit();

    mockMediaUploadCalls[0].onSelect(image(1, { alt: "A" }));

    expect(setAttributes).toHaveBeenCalledWith({
      images: [galleryImage(1, { alt: "A" })],
    });
  });

  it("appends new images while replacing any with matching ids", () => {
    const { setAttributes } = renderEdit({ images: [galleryImage(1), galleryImage(2)] });

    mockMediaUploadCalls[0].onSelect([image(2, { alt: "updated" }), image(3)]);

    expect(setAttributes).toHaveBeenCalledWith({
      images: [galleryImage(1), galleryImage(2, { alt: "updated" }), galleryImage(3)],
    });
  });

  it("maps a video item using its poster image and video type", () => {
    const { setAttributes } = renderEdit();

    mockMediaUploadCalls[0].onSelect(
      image(1, { mime: "video/mp4", url: "v.mp4", image: { src: "poster.jpg" } })
    );

    expect(setAttributes).toHaveBeenCalledWith({
      images: [
        galleryImage(1, {
          url: "v.mp4",
          thumbnailUrl: "poster.jpg",
          type: "video",
          poster: "poster.jpg",
        }),
      ],
    });
  });

  it("falls back to the sizes.large URL for the thumbnail when the item has no direct url", () => {
    const { setAttributes } = renderEdit();

    mockMediaUploadCalls[0].onSelect(
      image(1, {
        url: undefined as unknown as string,
        sizes: { large: { url: "large.jpg" }, medium: { url: "medium.jpg" } },
      })
    );

    expect(setAttributes).toHaveBeenCalledWith({
      images: [galleryImage(1, { url: undefined, thumbnailUrl: "large.jpg" })],
    });
  });

  it("removes an image via its sidebar remove button", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ images: [galleryImage(1), galleryImage(2)] });

    const removeButtons = within(mediaPanel()).getAllByRole("button", { name: "Remove" });
    await user.click(removeButtons[0]);

    expect(setAttributes).toHaveBeenCalledWith({ images: [galleryImage(2)] });
  });

  it("shows Add Images & Videos in the sidebar when empty, and Add More Media once populated", () => {
    const { rerender } = renderEdit();
    expect(
      within(mediaPanel()).getByRole("button", { name: "Add Images & Videos" })
    ).toBeInTheDocument();

    rerender(
      <Edit
        attributes={baseAttributes({ images: [galleryImage(1)] }) as never}
        setAttributes={jest.fn()}
      />
    );
    expect(
      within(mediaPanel()).getByRole("button", { name: "Add More Media" })
    ).toBeInTheDocument();
  });
});

describe("gallery-lightbox Edit — toggles", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.length = 0;
    lastCarouselPanelProps = null;
  });

  it("toggles lock height", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(
      within(mediaPanel()).getByRole("checkbox", { name: "Lock height to first image" })
    );

    expect(setAttributes).toHaveBeenCalledWith({ lockHeight: true });
  });

  it("hides the mobile media section until enabled", () => {
    renderEdit();

    expect(within(mediaPanel()).queryByText("Mobile media (≤768px)")).not.toBeInTheDocument();
  });

  it("toggles use different media on mobile", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(
      within(mediaPanel()).getByRole("checkbox", { name: "Use different media on mobile" })
    );

    expect(setAttributes).toHaveBeenCalledWith({ useMobileMedia: true });
  });

  it("shows the mobile media grid and upload button once enabled", () => {
    renderEdit({ useMobileMedia: true, mobileImages: [galleryImage(9)] });

    expect(within(mediaPanel()).getByText("Mobile media (≤768px)")).toBeInTheDocument();
    expect(
      within(mediaPanel()).getByRole("button", { name: "Add More Mobile Media" })
    ).toBeInTheDocument();
  });

  it("adds and replaces mobile media independently from the main images", () => {
    const { setAttributes } = renderEdit({
      images: [galleryImage(1)],
      useMobileMedia: true,
      mobileImages: [galleryImage(9)],
    });

    const mobileUpload = mockMediaUploadCalls[mockMediaUploadCalls.length - 1];
    mobileUpload.onSelect(image(10));

    expect(setAttributes).toHaveBeenCalledWith({
      mobileImages: [galleryImage(9), galleryImage(10)],
    });
  });

  it("removes a mobile image independently from the main images", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({
      images: [galleryImage(1)],
      useMobileMedia: true,
      mobileImages: [galleryImage(9)],
    });

    const removeButtons = within(mediaPanel()).getAllByRole("button", { name: "Remove" });
    await user.click(removeButtons[removeButtons.length - 1]);

    expect(setAttributes).toHaveBeenCalledWith({ mobileImages: [] });
  });
});

describe("gallery-lightbox Edit — CarouselPanel wiring", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.length = 0;
    lastCarouselPanelProps = null;
  });

  it("passes every attribute except images as carousel settings", () => {
    renderEdit({ images: [galleryImage(1)], lockHeight: true });

    expect(lastCarouselPanelProps?.settings).not.toHaveProperty("images");
    expect(lastCarouselPanelProps?.settings).toMatchObject({ lockHeight: true });
  });

  it("enables the lightbox-specific feature set with a custom title", () => {
    renderEdit();

    expect(lastCarouselPanelProps?.title).toBe("Lightbox Settings");
    expect(lastCarouselPanelProps?.features).toEqual({
      arrowsPosition: true,
      navColor: true,
      navPlacement: true,
      trackActiveSlide: true,
    });
  });

  it("forwards carousel settings changes to setAttributes", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("button", { name: "change-carousel-settings" }));

    expect(setAttributes).toHaveBeenCalledWith({ showArrows: false });
  });
});

describe("gallery-lightbox Edit — Video Options panel", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.length = 0;
    lastCarouselPanelProps = null;
  });

  it("hides the Video Options panel when there are no video items", () => {
    renderEdit({ images: [galleryImage(1)] });

    expect(screen.queryByRole("button", { name: "Video Options" })).not.toBeInTheDocument();
  });

  it("shows the Video Options panel once any item is a video", async () => {
    const user = userEvent.setup();
    renderEdit({ images: [galleryImage(1, { type: "video" })] });

    await user.click(screen.getByRole("button", { name: "Video Options" }));

    expect(screen.getByRole("checkbox", { name: "Show controls" })).toBeInTheDocument();
  });

  it("toggles video controls", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ images: [galleryImage(1, { type: "video" })] });
    await user.click(screen.getByRole("button", { name: "Video Options" }));

    await user.click(screen.getByRole("checkbox", { name: "Show controls" }));

    expect(setAttributes).toHaveBeenCalledWith({ videoControls: false });
  });

  it("forces muted on when autoplay is enabled", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({
      images: [galleryImage(1, { type: "video" })],
      videoMuted: false,
    });
    await user.click(screen.getByRole("button", { name: "Video Options" }));

    await user.click(screen.getByRole("checkbox", { name: "Autoplay when slide opens" }));

    expect(setAttributes).toHaveBeenCalledWith({ videoAutoplay: true, videoMuted: true });
  });

  it("shows Muted as checked whenever autoplay is on, even if videoMuted is false", async () => {
    const user = userEvent.setup();
    renderEdit({
      images: [galleryImage(1, { type: "video" })],
      videoAutoplay: true,
      videoMuted: false,
    });
    await user.click(screen.getByRole("button", { name: "Video Options" }));

    expect(screen.getByRole("checkbox", { name: "Muted" })).toBeChecked();
  });

  it("toggles loop", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ images: [galleryImage(1, { type: "video" })] });
    await user.click(screen.getByRole("button", { name: "Video Options" }));

    await user.click(screen.getByRole("checkbox", { name: "Loop" }));

    expect(setAttributes).toHaveBeenCalledWith({ videoLoop: true });
  });
});
