import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: () => <div data-testid="inner-blocks" />,
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

const mockCreateBlock = jest.fn(() => ({ name: "kotlinskidev/hero-carousel-slide" }));

jest.mock("@wordpress/blocks", () => ({
  createBlock: (...args: unknown[]) => mockCreateBlock(...args),
}));

interface SlideBlock {
  clientId: string;
  attributes: Record<string, unknown>;
}

const mockBlocks: Record<string, { innerBlocks: SlideBlock[] } | undefined> = {};
const mockSelectedBlockClientId = { current: null as string | null };
const mockBlockParents: { current: (id: string) => string[] } = { current: () => [] };
const mockInsertBlock = jest.fn();
const mockRemoveBlock = jest.fn();
const mockSelectBlock = jest.fn();

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    actions: {
      insertBlock: (...args: unknown[]) => {
        mockInsertBlock(...args);
        return { type: "NOOP" };
      },
      removeBlock: (...args: unknown[]) => {
        mockRemoveBlock(...args);
        return { type: "NOOP" };
      },
      selectBlock: (...args: unknown[]) => {
        mockSelectBlock(...args);
        return { type: "NOOP" };
      },
    },
    selectors: {
      getBlock: (_state: unknown, clientId: string) => mockBlocks[clientId],
      getSelectedBlockClientId: () => mockSelectedBlockClientId.current,
      getBlockParents: (_state: unknown, id: string) => mockBlockParents.current(id),
    },
  })
);

import Edit from "./edit";

function slides(count: number, imageAt: number[] = []): SlideBlock[] {
  return Array.from({ length: count }, (_, i) => ({
    clientId: `slide-${i}`,
    attributes: imageAt.includes(i) ? { bgImageUrl: `img-${i}.jpg` } : {},
  }));
}

function baseAttributes() {
  return {
    minHeight: 80,
    showArrows: true,
    showPagination: true,
    arrowsPosition: "sides" as const,
    navColor: "",
    navColorOnHover: false,
    navPlacement: "inside" as const,
  };
}

function setup(
  innerBlocks: SlideBlock[],
  attributes: Partial<ReturnType<typeof baseAttributes>> = {}
) {
  mockBlocks["1"] = { innerBlocks };
  const setAttributes = jest.fn();
  const utils = render(
    <Edit
      clientId="1"
      attributes={{ ...baseAttributes(), ...attributes }}
      setAttributes={setAttributes}
    />
  );
  return { ...utils, setAttributes };
}

describe("hero-carousel Edit", () => {
  beforeEach(() => {
    mockCreateBlock.mockClear();
    mockInsertBlock.mockClear();
    mockRemoveBlock.mockClear();
    mockSelectBlock.mockClear();
    mockSelectedBlockClientId.current = null;
    mockBlockParents.current = () => [];
    lastCarouselPanelProps = null;
    Object.keys(mockBlocks).forEach((key) => delete mockBlocks[key]);
  });

  it("starts on the first slide", () => {
    const { container } = setup(slides(2));

    expect(container.querySelector(".hero-carousel")).toHaveAttribute("data-active-slide", "0");
  });

  it("reflects minHeight as the CSS custom property", () => {
    const { container } = setup(slides(2), { minHeight: 60 });

    expect(
      (container.querySelector(".hero-carousel") as HTMLElement).style.getPropertyValue(
        "--hero-min-height"
      )
    ).toBe("calc(60svh - var(--admin-bar-offset, 0px))");
  });

  it("updates minHeight once the Height panel is opened", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup(slides(2));

    await user.click(screen.getByRole("button", { name: "Height" }));
    const slider = screen.getByRole("slider", { name: "Min Height (vh)" });
    expect(slider).toHaveValue("80");

    fireEvent.change(slider, { target: { value: "81" } });

    expect(setAttributes).toHaveBeenCalledWith({ minHeight: 81 });
  });

  it("passes the carousel settings (excluding minHeight) and the enabled feature set to CarouselPanel", () => {
    setup(slides(2), { showArrows: false });

    expect(lastCarouselPanelProps?.settings).not.toHaveProperty("minHeight");
    expect(lastCarouselPanelProps?.settings).toMatchObject({ showArrows: false });
    expect(lastCarouselPanelProps?.features).toEqual({
      arrowsPosition: true,
      navColor: true,
      navPlacement: true,
      autoplay: true,
      lazyLoad: true,
    });
  });

  it("forwards carousel settings changes to setAttributes", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup(slides(2));

    await user.click(screen.getByRole("button", { name: "change-carousel-settings" }));

    expect(setAttributes).toHaveBeenCalledWith({ showArrows: false });
  });

  it("lists a sidebar entry per slide, using its background image or a fallback number", () => {
    const { container } = setup(slides(2, [1]));

    const entries = container.querySelectorAll(".hero-carousel-sidebar-slide");
    expect(entries).toHaveLength(2);
    expect(entries[0]).toHaveClass("hero-carousel-sidebar-slide--empty");
    expect(entries[0].querySelector("span")).toHaveTextContent("1");
    expect(entries[1].querySelector("img")).toHaveAttribute("src", "img-1.jpg");
  });

  it("marks the active slide in the sidebar", () => {
    mockSelectedBlockClientId.current = "slide-1";
    mockBlockParents.current = () => [];
    const { container } = setup(slides(2));

    const entries = container.querySelectorAll(".hero-carousel-sidebar-slide");
    expect(entries[1]).toHaveClass("hero-carousel-sidebar-slide--active");
  });

  it("navigates via clicking a sidebar slide", async () => {
    const user = userEvent.setup();
    const { container } = setup(slides(3));

    const entries = container.querySelectorAll(".hero-carousel-sidebar-slide");
    await user.click(entries[2]);

    expect(mockSelectBlock).toHaveBeenCalledWith("1");
    expect(container.querySelector(".hero-carousel")).toHaveAttribute("data-active-slide", "2");
  });

  it("hides the remove button when there is only one slide", () => {
    const { container } = setup(slides(1));

    expect(container.querySelector(".hero-carousel-sidebar-remove")).not.toBeInTheDocument();
  });

  it("removes a slide without also navigating to it", async () => {
    const user = userEvent.setup();
    const { container } = setup(slides(3));

    const removeButtons = container.querySelectorAll(".hero-carousel-sidebar-remove");
    await user.click(removeButtons[1]);

    expect(mockRemoveBlock).toHaveBeenCalledWith("slide-1");
    expect(mockSelectBlock).not.toHaveBeenCalled();
  });

  it("adds a slide from the sidebar button", async () => {
    const user = userEvent.setup();
    setup(slides(2));

    await user.click(screen.getByRole("button", { name: "+ Add Slide" }));

    expect(mockCreateBlock).toHaveBeenCalledWith("kotlinskidev/hero-carousel-slide");
    expect(mockInsertBlock).toHaveBeenCalledWith(
      { name: "kotlinskidev/hero-carousel-slide" },
      undefined,
      "1"
    );
  });

  it("adds a slide from the floating canvas button", async () => {
    const user = userEvent.setup();
    setup(slides(2));

    await user.click(screen.getByTitle("Add slide"));

    expect(mockInsertBlock).toHaveBeenCalled();
  });

  it("renders prev/next arrows and disables prev on the first slide", () => {
    const { container } = setup(slides(2));

    const prev = container.querySelector(".swiper-button-prev");
    const next = container.querySelector(".swiper-button-next");
    expect(prev).toHaveClass("swiper-button-disabled");
    expect(next).not.toHaveClass("swiper-button-disabled");
  });

  it("navigates to the next slide when the next arrow is clicked", async () => {
    const user = userEvent.setup();
    const { container } = setup(slides(2));

    await user.click(container.querySelector(".swiper-button-next") as Element);

    expect(container.querySelector(".hero-carousel")).toHaveAttribute("data-active-slide", "1");
    expect(mockSelectBlock).toHaveBeenCalledWith("1");
  });

  it("does not navigate past the first slide via the prev arrow", async () => {
    const user = userEvent.setup();
    const { container } = setup(slides(2));

    await user.click(container.querySelector(".swiper-button-prev") as Element);

    expect(mockSelectBlock).not.toHaveBeenCalled();
  });

  it("navigates the next arrow via the keyboard", () => {
    const { container } = setup(slides(2));
    const next = container.querySelector(".swiper-button-next") as HTMLElement;

    fireEvent.keyDown(next, { key: "Enter" });

    expect(mockSelectBlock).toHaveBeenCalledWith("1");
  });

  it("hides navigation entirely when showArrows is false", () => {
    const { container } = setup(slides(2), { showArrows: false });

    expect(container.querySelector(".carousel-nav")).not.toBeInTheDocument();
  });

  it("hides pagination entirely when showPagination is false", () => {
    const { container } = setup(slides(2), { showPagination: false });

    expect(container.querySelector(".swiper-pagination")).not.toBeInTheDocument();
  });

  it("renders a pagination bullet per slide and marks the active one", () => {
    const { container } = setup(slides(3));

    const bullets = container.querySelectorAll(".swiper-pagination-bullet");
    expect(bullets).toHaveLength(3);
    expect(bullets[0]).toHaveClass("swiper-pagination-bullet-active");
  });

  it("navigates via clicking a pagination bullet", async () => {
    const user = userEvent.setup();
    const { container } = setup(slides(3));

    const bullets = container.querySelectorAll(".swiper-pagination-bullet");
    await user.click(bullets[2]);

    expect(container.querySelector(".hero-carousel")).toHaveAttribute("data-active-slide", "2");
  });

  it("shows a slide counter and moves the nav outside once arrowsPosition is not 'sides'", () => {
    const { container } = setup(slides(2), { arrowsPosition: "top", navPlacement: "outside" });

    expect(container.querySelector(".carousel-nav__counter")).toHaveTextContent("01 / 02");
    expect(container.querySelector(".carousel-nav--outside")).not.toBeNull();
    expect(container.querySelector(".swiper-pagination")).not.toBeInTheDocument();
  });

  it("sets the flat nav color CSS variable when navColorOnHover is off", () => {
    const { container } = setup(slides(2), { navColor: "#ff0000", navColorOnHover: false });

    expect(
      (container.querySelector(".hero-carousel") as HTMLElement).style.getPropertyValue(
        "--carousel-nav-color"
      )
    ).toBe("#ff0000");
  });

  it("sets the hover nav color CSS variable when navColorOnHover is on", () => {
    const { container } = setup(slides(2), { navColor: "#00ff00", navColorOnHover: true });

    expect(
      (container.querySelector(".hero-carousel") as HTMLElement).style.getPropertyValue(
        "--carousel-nav-color-hover"
      )
    ).toBe("#00ff00");
  });
});
