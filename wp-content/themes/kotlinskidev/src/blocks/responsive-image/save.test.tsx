import { render } from "@testing-library/react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: { save: () => ({}) },
}));

import save from "./save";

describe("responsive-image save", () => {
  it("renders only the desktop image when no mobile image is set", () => {
    const { container } = render(save({ attributes: { desktopImageUrl: "desktop.jpg" } }));

    expect(container.querySelector("source")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", "desktop.jpg");
  });

  it("renders a source element with the mobile image and breakpoint media query", () => {
    const { container } = render(
      save({
        attributes: {
          desktopImageUrl: "desktop.jpg",
          mobileImageUrl: "mobile.jpg",
          breakpoint: 600,
        },
      })
    );

    const source = container.querySelector("source");
    expect(source).toHaveAttribute("srcset", "mobile.jpg");
    expect(source).toHaveAttribute("media", "(max-width: 600px)");
  });

  it("defaults the breakpoint to 767px", () => {
    const { container } = render(
      save({ attributes: { desktopImageUrl: "desktop.jpg", mobileImageUrl: "mobile.jpg" } })
    );

    expect(container.querySelector("source")).toHaveAttribute("media", "(max-width: 767px)");
  });

  it("falls back to the mobile image as the img src when there is no desktop image", () => {
    const { container } = render(save({ attributes: { mobileImageUrl: "mobile.jpg" } }));

    expect(container.querySelector("img")).toHaveAttribute("src", "mobile.jpg");
  });

  it("defaults loading to lazy and respects an explicit override", () => {
    const { container: lazyContainer } = render(save({ attributes: {} }));
    expect(lazyContainer.querySelector("img")).toHaveAttribute("loading", "lazy");

    const { container: eagerContainer } = render(save({ attributes: { loading: "eager" } }));
    expect(eagerContainer.querySelector("img")).toHaveAttribute("loading", "eager");
  });

  it("passes the alt text through to the image", () => {
    const { container } = render(save({ attributes: { alt: "A description" } }));

    expect(container.querySelector("img")).toHaveAttribute("alt", "A description");
  });
});
