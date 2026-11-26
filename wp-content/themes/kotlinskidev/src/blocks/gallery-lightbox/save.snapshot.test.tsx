import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: {
    save: (props: Record<string, unknown> = {}) => ({ className: "wp-block-x", ...props }),
  },
}));

import Save from "./save";

const photo = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  url: "a.jpg",
  alt: "A photo",
  caption: "Caption",
  ...overrides,
});

const attributeSets: Record<string, Record<string, unknown>> = {
  "single image": { images: [photo()] },
  "several images": { images: [photo(), photo({ id: 2, url: "b.jpg" }), photo({ id: 3 })] },
  "sized first image": { images: [photo({ width: 800, height: 600 }), photo({ id: 2 })] },
  "video first": {
    images: [
      photo({ type: "video", url: "v.mp4", poster: "p.jpg", width: 1280, height: 720 }),
      photo({ id: 2 }),
    ],
  },
  "video without poster": { images: [photo({ type: "video", url: "v.mp4" })] },
  "no alt on first": { images: [photo({ alt: "" }), photo({ id: 2 })] },
  "tracked active slide": {
    images: [photo(), photo({ id: 2 })],
    trackActiveSlide: true,
    lazyLoad: true,
  },
  "mobile media": {
    images: [photo(), photo({ id: 2 })],
    useMobileMedia: true,
    mobileImages: [photo({ id: 9, url: "m.jpg", width: 400, height: 500 })],
  },
  "mobile media enabled but empty": {
    images: [photo()],
    useMobileMedia: true,
    mobileImages: [],
  },
  "every setting": {
    images: [photo({ width: 10, height: 20 }), photo({ id: 2, type: "video", poster: "q.jpg" })],
    showArrows: true,
    showPagination: false,
    loop: true,
    autoplay: true,
    autoplayDelay: 2500,
    slidesPerView: 1,
    lazyLoad: false,
    arrowsPosition: "bottom-right",
    navColor: "#123456",
    navColorOnHover: true,
    navPlacement: "outside",
    trackActiveSlide: false,
    transitionEffect: "flip",
    autoHeight: true,
    useMobileMedia: true,
    mobileImages: [photo({ id: 5, url: "n.jpg" })],
  },
  "empty images": { images: [] },
};

describe("gallery-lightbox save markup", () => {
  it.each(Object.entries(attributeSets))("%s", (_name, attributes) => {
    const { container } = render(<Save attributes={attributes as never} />);

    expect(container.innerHTML).toMatchSnapshot();
  });
});
