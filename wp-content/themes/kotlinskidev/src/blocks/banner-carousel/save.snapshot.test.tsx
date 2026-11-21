import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: { save: (props: Record<string, unknown> = {}) => props },
}));

import save from "./save";

const images = [{ url: "a.jpg", alt: "First" }, { url: "b.jpg" }, { url: "c.jpg", alt: "Third" }];

const everyAttribute = {
  images,
  showArrows: true,
  showPagination: true,
  showScrollbar: true,
  loop: true,
  draggable: true,
  autoplay: true,
  autoplayDelay: 4500,
  slidesPerView: 2,
  slidesPerMobile: 1,
  slidesPerTablet: 2,
  slidesPerDesktop: "auto" as const,
  lazyLoad: true,
  arrowsPosition: "bottom-center" as const,
  navColor: "#ff00aa",
  navColorOnHover: true,
  navPlacement: "outside" as const,
  trackActiveSlide: true,
  paginationPlacement: "outside" as const,
  transitionEffect: "fade" as const,
  autoHeight: true,
};

const attributeSets: Record<string, Record<string, unknown>> = {
  defaults: { images },
  "every attribute set": everyAttribute,
  "empty images": { images: [] },
  "no images key": {},
  "arrows hidden": { images, showArrows: false },
  "inside custom nav": { images, arrowsPosition: "bottom-left", navPlacement: "inside" },
  "outside side arrows": { images, arrowsPosition: "sides", navPlacement: "outside" },
  "nav color on side arrows": { images, navColor: "rebeccapurple" },
  "lazy first image": { images, lazyLoad: true },
};

describe("banner-carousel save markup", () => {
  it.each(Object.entries(attributeSets))("%s", (_name, attributes) => {
    const { container } = render(save({ attributes: attributes as never }));

    expect(container.innerHTML).toMatchSnapshot();
  });
});
