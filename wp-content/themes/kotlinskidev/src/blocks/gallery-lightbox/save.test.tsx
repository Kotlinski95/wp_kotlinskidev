import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: { save: () => ({}) },
}));

import Save from "./save";

const image = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  url: "a.jpg",
  alt: "A photo",
  caption: "",
  ...overrides,
});

describe("gallery-lightbox save", () => {
  it("renders nothing when there are no images", () => {
    const { container } = render(<Save attributes={{ images: [] }} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders a trigger button with the first image", () => {
    const { container } = render(<Save attributes={{ images: [image()] }} />);

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "a.jpg");
    expect(img).toHaveAttribute("alt", "A photo");
  });

  it("embeds the images as JSON with normalized defaults", () => {
    const { container } = render(
      <Save attributes={{ images: [image({ width: 800, height: 600 })] }} />
    );

    const data = JSON.parse(container.firstElementChild?.getAttribute("data-images") ?? "[]");
    expect(data).toEqual([
      { src: "a.jpg", alt: "A photo", type: "image", poster: "", width: 800, height: 600 },
    ]);
  });

  it("embeds the carousel settings, excluding images and mobile-media fields", () => {
    const { container } = render(
      <Save
        attributes={{
          images: [image()],
          showArrows: false,
          useMobileMedia: true,
          mobileImages: [],
        }}
      />
    );

    const settings = JSON.parse(container.firstElementChild?.getAttribute("data-settings") ?? "{}");
    expect(settings).toEqual({ showArrows: false });
  });

  it("does not set data-mobile-images when useMobileMedia is off", () => {
    const { container } = render(
      <Save attributes={{ images: [image()], mobileImages: [image({ url: "mobile.jpg" })] }} />
    );

    expect(container.firstElementChild).not.toHaveAttribute("data-mobile-images");
  });

  it("sets data-mobile-images when useMobileMedia is on and mobile images exist", () => {
    const { container } = render(
      <Save
        attributes={{
          images: [image()],
          useMobileMedia: true,
          mobileImages: [image({ url: "mobile.jpg" })],
        }}
      />
    );

    const data = JSON.parse(
      container.firstElementChild?.getAttribute("data-mobile-images") ?? "[]"
    );
    expect(data[0].src).toBe("mobile.jpg");
  });

  it("falls back to the poster image for a video trigger", () => {
    const { container } = render(
      <Save
        attributes={{
          images: [image({ type: "video", url: "clip.mp4", poster: "poster.jpg" })],
        }}
      />
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "poster.jpg");
    expect(container.querySelector(".gallery-lightbox-video-badge")).not.toBeNull();
  });

  it("uses the video url directly when there is no poster", () => {
    const { container } = render(
      <Save attributes={{ images: [image({ type: "video", url: "clip.mp4" })] }} />
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "clip.mp4");
  });

  it("does not show a count badge for a single image", () => {
    const { container } = render(<Save attributes={{ images: [image()] }} />);

    expect(container.querySelector(".gallery-lightbox-count")).toBeNull();
  });

  it("shows a +N count badge for multiple images without slide tracking", () => {
    const { container } = render(<Save attributes={{ images: [image(), image(), image()] }} />);

    expect(container.querySelector(".gallery-lightbox-count")).toHaveTextContent("+2");
    expect(container.querySelector(".gallery-lightbox-trigger")).toHaveAttribute(
      "aria-label",
      "A photo +2"
    );
  });

  it("shows a paginated count badge for multiple images with slide tracking", () => {
    const { container } = render(
      <Save attributes={{ images: [image(), image()], trackActiveSlide: true }} />
    );

    expect(container.querySelector(".gallery-lightbox-count__current")).toHaveTextContent("01");
    expect(container.querySelector(".gallery-lightbox-count")).toHaveTextContent("01 / 02");
    expect(container.querySelector(".gallery-lightbox-trigger")).toHaveAttribute(
      "aria-label",
      "A photo 01 / 02"
    );
  });

  it("falls back to a generic aria-label when the first image has no alt text", () => {
    const { container } = render(<Save attributes={{ images: [image({ alt: "" })] }} />);

    expect(container.querySelector(".gallery-lightbox-trigger")).toHaveAttribute(
      "aria-label",
      "Open gallery"
    );
  });

  it("sets the aspect-ratio style when the first image has known dimensions", () => {
    const { container } = render(
      <Save attributes={{ images: [image({ width: 4, height: 3 })] }} />
    );

    expect(
      (container.querySelector(".gallery-lightbox-trigger") as HTMLElement).style.aspectRatio
    ).toBe("4/3");
  });

  it("defaults image loading to eager and respects lazyLoad", () => {
    const { container: eagerContainer } = render(<Save attributes={{ images: [image()] }} />);
    expect(eagerContainer.querySelector("img")).toHaveAttribute("loading", "eager");

    const { container: lazyContainer } = render(
      <Save attributes={{ images: [image()], lazyLoad: true }} />
    );
    expect(lazyContainer.querySelector("img")).toHaveAttribute("loading", "lazy");
  });
});
