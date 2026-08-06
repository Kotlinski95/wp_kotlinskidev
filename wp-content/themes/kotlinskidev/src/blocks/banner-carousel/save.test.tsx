import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: { save: (props: Record<string, unknown>) => props },
}));

import save from "./save";

const images = [
  { url: "a.jpg", alt: "First" },
  { url: "b.jpg", alt: "Second" },
];

describe("banner-carousel save", () => {
  it("renders one slide per image with the correct src and alt", () => {
    const { container } = render(save({ attributes: { images } }));

    const slides = container.querySelectorAll(".swiper-slide img");
    expect(slides).toHaveLength(2);
    expect(slides[0]).toHaveAttribute("src", "a.jpg");
    expect(slides[0]).toHaveAttribute("alt", "First");
    expect(slides[1]).toHaveAttribute("src", "b.jpg");
  });

  it("marks the first slide eager and the rest lazy by default", () => {
    const { container } = render(save({ attributes: { images } }));

    const slides = container.querySelectorAll(".swiper-slide img");
    expect(slides[0]).toHaveAttribute("loading", "eager");
    expect(slides[1]).toHaveAttribute("loading", "lazy");
  });

  it("marks even the first slide lazy when lazyLoad is enabled", () => {
    const { container } = render(save({ attributes: { images, lazyLoad: true } }));

    expect(container.querySelectorAll(".swiper-slide img")[0]).toHaveAttribute("loading", "lazy");
  });

  it("embeds the carousel settings (excluding images) as JSON data", () => {
    const { container } = render(
      save({ attributes: { images, showArrows: false, autoplay: true } })
    );

    const settings = JSON.parse(
      container.querySelector(".swiper")?.getAttribute("data-carousel-settings") ?? "{}"
    );
    expect(settings).toEqual({ showArrows: false, autoplay: true });
  });

  it("renders plain prev/next buttons when arrows are on the default sides position", () => {
    const { container } = render(save({ attributes: { images } }));

    expect(container.querySelector(".carousel-nav")).toBeNull();
    expect(container.querySelector(".swiper > .swiper-button-prev")).not.toBeNull();
    expect(container.querySelector(".swiper > .swiper-button-next")).not.toBeNull();
  });

  it("renders no navigation at all when arrows are disabled", () => {
    const { container } = render(save({ attributes: { images, showArrows: false } }));

    expect(container.querySelector(".carousel-nav")).toBeNull();
    expect(container.querySelector(".swiper-button-prev")).toBeNull();
  });

  it("renders a custom nav wrapper inside the swiper for a non-default arrow position", () => {
    const { container } = render(save({ attributes: { images, arrowsPosition: "bottom-left" } }));

    const nav = container.querySelector(".swiper .carousel-nav");
    expect(nav).not.toBeNull();
    expect(nav?.className).toBe("carousel-nav carousel-nav--bottom-left");
  });

  it("renders the custom nav wrapper outside the swiper when navPlacement is outside", () => {
    const { container } = render(
      save({
        attributes: { images, arrowsPosition: "bottom-center", navPlacement: "outside" },
      })
    );

    expect(container.querySelector(".swiper .carousel-nav")).toBeNull();
    const nav = container.querySelector(":scope > .banner-carousel > .carousel-nav");
    expect(nav).not.toBeNull();
    expect(nav?.className).toBe("carousel-nav carousel-nav--outside carousel-nav--bottom-center");
  });

  it("applies the custom nav color as CSS variables", () => {
    const { container } = render(
      save({ attributes: { images, arrowsPosition: "bottom-left", navColor: "#8209d3" } })
    );

    const nav = container.querySelector(".carousel-nav") as HTMLElement;
    expect(nav.style.getPropertyValue("--carousel-nav-color")).toBe("#8209d3");
    expect(nav.style.getPropertyValue("--carousel-nav-border-color")).toBe("#8209d3");
  });

  it("does not set an inline style when no nav color is given", () => {
    const { container } = render(save({ attributes: { images, arrowsPosition: "bottom-left" } }));

    const nav = container.querySelector(".carousel-nav") as HTMLElement;
    expect(nav.getAttribute("style")).toBeNull();
  });

  it("renders no images at all when the images attribute is missing", () => {
    const { container } = render(save({ attributes: {} as never }));

    expect(container.querySelectorAll(".swiper-slide")).toHaveLength(0);
  });
});
