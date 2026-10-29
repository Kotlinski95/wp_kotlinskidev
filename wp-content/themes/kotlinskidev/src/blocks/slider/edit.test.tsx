import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, createSelector, register } from "@wordpress/data";

jest.mock("./assets/image1.webp", () => "image1.webp", { virtual: true });
jest.mock("./assets/image2.webp", () => "image2.webp", { virtual: true });
jest.mock("./assets/image3.webp", () => "image3.webp", { virtual: true });

const mockInsertBlock = jest.fn();
const mockSelectBlock = jest.fn();
const mockBlocks: Record<string, { innerBlocks: Array<{ clientId: string }> } | undefined> = {};

let mockSelectedBlockClientId: string | null = null;

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    actions: {
      insertBlock: (...args: unknown[]) => {
        mockInsertBlock(...args);
        return { type: "NOOP" };
      },
      selectBlock: (...args: unknown[]) => {
        mockSelectBlock(...args);
        return { type: "NOOP" };
      },
    },
    selectors: {
      getBlock: (_state: unknown, clientId: string) => mockBlocks[clientId],
      getBlockOrder: createSelector(
        (_state: unknown, clientId: string) =>
          (mockBlocks[clientId]?.innerBlocks ?? []).map((block) => block.clientId),
        (_state: unknown, clientId: string) => [mockBlocks[clientId]?.innerBlocks]
      ),
      getSelectedBlockClientId: () => mockSelectedBlockClientId,
      getBlockParents: () => [],
    },
  })
);

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  useInnerBlocksProps: (wrapperProps: Record<string, unknown>) => wrapperProps,
  useBlockEditContext: () => ({ clientId: "slider-1" }),
  store: "core/block-editor",
  BlockControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ButtonBlockAppender: ({ rootClientId }: { rootClientId: string }) => (
    <button data-testid="button-block-appender" data-root={rootClientId}>
      Add block
    </button>
  ),
}));

const mockCreateBlock = jest.fn((name: string) => ({ name, clientId: "new-slide" }));

jest.mock("@wordpress/blocks", () => ({
  createBlock: (...args: unknown[]) => mockCreateBlock(...(args as [string])),
}));

import Edit from "./edit";
import { DEFAULT_BLOCK } from "./constants";

function baseAttributes() {
  return {
    autoplay: false,
    autoplayTime: 5,
    smoothTransition: false,
    continuousAutoplay: false,
    navigation: true,
    pagination: true,
    showProgress: false,
    slidesPerView: 1,
    slidesPerMobile: 1,
    slidesPerTablet: 2,
    slidesPerDesktop: 3,
    scrollbar: false,
    loop: false,
    mousewheel: false,
    keyboard: false,
    spaceBetween: 10,
    centerSlides: false,
    peek: 20,
    slideMaxWidth: "900px",
    paginationPlacement: "outside" as const,
  };
}

function renderEdit(overrides: Partial<ReturnType<typeof baseAttributes>> = {}) {
  const setAttributes = jest.fn();
  const utils = render(
    <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
  );
  return { ...utils, setAttributes };
}

describe("slider Edit", () => {
  beforeEach(() => {
    mockInsertBlock.mockClear();
    mockSelectBlock.mockClear();
    mockCreateBlock.mockClear();
    mockBlocks["slider-1"] = { innerBlocks: [] };
    mockSelectedBlockClientId = null;
  });

  it("renders the ButtonBlockAppender scoped to the slider block", () => {
    renderEdit();

    expect(screen.getByTestId("button-block-appender")).toHaveAttribute("data-root", "slider-1");
  });

  it("inserts a new slide at the end of the existing slides when Add Slide is clicked", async () => {
    mockBlocks["slider-1"] = { innerBlocks: [{ clientId: "a" }, { clientId: "b" }] };
    const user = userEvent.setup();
    renderEdit();

    await user.click(screen.getByRole("button", { name: "Add Slide" }));

    expect(mockCreateBlock).toHaveBeenCalledWith(DEFAULT_BLOCK, expect.any(Object));
    expect(mockInsertBlock).toHaveBeenCalledWith(
      { name: DEFAULT_BLOCK, clientId: "new-slide" },
      2,
      "slider-1",
      false
    );
    expect(mockSelectBlock).toHaveBeenCalledWith("new-slide");
  });

  it("does not render slide-switching nav for a single slide", () => {
    mockBlocks["slider-1"] = { innerBlocks: [{ clientId: "a" }] };
    renderEdit();

    expect(screen.queryByRole("button", { name: "Next slide" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Go to slide 1" })).not.toBeInTheDocument();
  });

  it("switches the active slide and selects its block when Next is clicked", async () => {
    mockBlocks["slider-1"] = {
      innerBlocks: [{ clientId: "a" }, { clientId: "b" }, { clientId: "c" }],
    };
    const user = userEvent.setup();
    renderEdit();

    expect(screen.getByRole("button", { name: "Previous slide" })).toHaveClass(
      "swiper-button-disabled"
    );

    await user.click(screen.getByRole("button", { name: "Next slide" }));

    expect(mockSelectBlock).toHaveBeenCalledWith("b");
  });

  it("switches the active slide and selects its block when a pagination dot is clicked", async () => {
    mockBlocks["slider-1"] = {
      innerBlocks: [{ clientId: "a" }, { clientId: "b" }, { clientId: "c" }],
    };
    const user = userEvent.setup();
    renderEdit();

    await user.click(screen.getByRole("button", { name: "Go to slide 3" }));

    expect(mockSelectBlock).toHaveBeenCalledWith("c");
  });

  it("shows a fallback editor-only switcher when navigation, pagination, and scrollbar are all disabled — otherwise off-screen slides would be unreachable", () => {
    mockBlocks["slider-1"] = {
      innerBlocks: [{ clientId: "a" }, { clientId: "b" }, { clientId: "c" }],
    };
    renderEdit({ navigation: false, pagination: false, scrollbar: false });

    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to slide 1" })).toBeInTheDocument();
  });

  it("hides the fallback switcher once any one of navigation/pagination/scrollbar is enabled, deferring to the real (frontend-matching) controls instead", () => {
    mockBlocks["slider-1"] = {
      innerBlocks: [{ clientId: "a" }, { clientId: "b" }, { clientId: "c" }],
    };
    renderEdit({ navigation: false, pagination: false, scrollbar: true });

    expect(screen.queryByRole("button", { name: "Next slide" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Go to slide 1" })).not.toBeInTheDocument();
  });

  it("shows only the real navigation arrows (not pagination dots) when navigation is on but pagination is off", () => {
    mockBlocks["slider-1"] = {
      innerBlocks: [{ clientId: "a" }, { clientId: "b" }, { clientId: "c" }],
    };
    renderEdit({ navigation: true, pagination: false, scrollbar: false });

    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Go to slide 1" })).not.toBeInTheDocument();
  });

  it("applies the has-center-slides layout with peek/max-width CSS variables mirroring the frontend when centerSlides is on", () => {
    mockBlocks["slider-1"] = { innerBlocks: [{ clientId: "a" }, { clientId: "b" }] };
    renderEdit({ centerSlides: true, peek: 30, slideMaxWidth: "700px" });

    const swiperEl = document.querySelector(".swiper");
    expect(swiperEl).toHaveClass("has-center-slides");
    expect((swiperEl as HTMLElement).style.getPropertyValue("--kt-slider-slide-width")).toBe("40%");
    expect((swiperEl as HTMLElement).style.getPropertyValue("--kt-slider-slide-max-width")).toBe(
      "700px"
    );
  });

  it("applies a flat per-slide width CSS variable derived from slidesPerView/spaceBetween when centerSlides is off", () => {
    mockBlocks["slider-1"] = { innerBlocks: [{ clientId: "a" }, { clientId: "b" }] };
    renderEdit({ centerSlides: false, slidesPerView: 3, spaceBetween: 20 });

    const swiperEl = document.querySelector(".swiper") as HTMLElement;
    expect(swiperEl).not.toHaveClass("has-center-slides");
    expect(swiperEl.style.getPropertyValue("--kt-slider-editor-flat-width")).toBe(
      "calc((100% - 40px) / 3)"
    );
  });

  it("toggles autoplay", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Autoplay" }));

    expect(setAttributes).toHaveBeenCalledWith({ autoplay: true });
  });

  it("toggles navigation", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Navigation" }));

    expect(setAttributes).toHaveBeenCalledWith({ navigation: false });
  });

  it("toggles pagination", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Pagination" }));

    expect(setAttributes).toHaveBeenCalledWith({ pagination: false });
  });

  it("shows the pagination-placement toggle only while pagination is enabled", () => {
    const { rerender } = renderEdit({ pagination: true });
    expect(
      screen.getByRole("checkbox", { name: "Show pagination outside carousel" })
    ).toBeInTheDocument();

    rerender(
      <Edit attributes={{ ...baseAttributes(), pagination: false }} setAttributes={jest.fn()} />
    );
    expect(
      screen.queryByRole("checkbox", { name: "Show pagination outside carousel" })
    ).not.toBeInTheDocument();
  });

  it("shows the continuous-autoplay toggle only while autoplay is enabled", () => {
    const { rerender } = renderEdit({ autoplay: true });
    expect(screen.getByRole("checkbox", { name: "Continuous Autoplay" })).toBeInTheDocument();

    rerender(
      <Edit attributes={{ ...baseAttributes(), autoplay: false }} setAttributes={jest.fn()} />
    );
    expect(screen.queryByRole("checkbox", { name: "Continuous Autoplay" })).not.toBeInTheDocument();
  });

  it("toggles continuousAutoplay", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ autoplay: true, continuousAutoplay: false });

    await user.click(screen.getByRole("checkbox", { name: "Continuous Autoplay" }));

    expect(setAttributes).toHaveBeenCalledWith({ continuousAutoplay: true });
  });

  it("shows the progress-circle toggle only while autoplay is on and continuousAutoplay is off", () => {
    const { rerender } = renderEdit({ autoplay: true, continuousAutoplay: false });
    expect(screen.getByRole("checkbox", { name: "Show progress circle" })).toBeInTheDocument();

    rerender(
      <Edit
        attributes={{ ...baseAttributes(), autoplay: true, continuousAutoplay: true }}
        setAttributes={jest.fn()}
      />
    );
    expect(
      screen.queryByRole("checkbox", { name: "Show progress circle" })
    ).not.toBeInTheDocument();

    rerender(
      <Edit
        attributes={{ ...baseAttributes(), autoplay: false, continuousAutoplay: false }}
        setAttributes={jest.fn()}
      />
    );
    expect(
      screen.queryByRole("checkbox", { name: "Show progress circle" })
    ).not.toBeInTheDocument();
  });

  it("toggles showProgress", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ autoplay: true, showProgress: false });

    await user.click(screen.getByRole("checkbox", { name: "Show progress circle" }));

    expect(setAttributes).toHaveBeenCalledWith({ showProgress: true });
  });

  it("toggles paginationPlacement between outside and inside", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ pagination: true, paginationPlacement: "outside" });

    await user.click(screen.getByRole("checkbox", { name: "Show pagination outside carousel" }));

    expect(setAttributes).toHaveBeenCalledWith({ paginationPlacement: "inside" });
  });

  it("toggles continuousAutoplay, which changes the autoplay-time help text", () => {
    const { rerender } = renderEdit({ continuousAutoplay: false });
    expect(screen.getByText("Set the autoplay interval in seconds.")).toBeInTheDocument();

    rerender(
      <Edit
        attributes={{ ...baseAttributes(), continuousAutoplay: true }}
        setAttributes={jest.fn()}
      />
    );
    expect(
      screen.getByText("Set how long one full continuous scroll cycle takes, in seconds.")
    ).toBeInTheDocument();
  });

  it("updates the autoplay time", () => {
    const { setAttributes } = renderEdit();

    const slider = screen.getByRole("slider", { name: "Autoplay Time (seconds)" });
    fireEvent.change(slider, { target: { value: "8" } });

    expect(setAttributes).toHaveBeenCalledWith({ autoplayTime: 8 });
  });

  it("updates slides per view/mobile/tablet/desktop independently", () => {
    const { setAttributes } = renderEdit();

    const changeSlider = (name: string, value: string) => {
      const slider = screen.getByRole("slider", { name });
      fireEvent.change(slider, { target: { value } });
    };

    changeSlider("Slides Per View", "2");
    expect(setAttributes).toHaveBeenCalledWith({ slidesPerView: 2 });

    changeSlider("Slides Per Mobile", "2");
    expect(setAttributes).toHaveBeenCalledWith({ slidesPerMobile: 2 });

    changeSlider("Slides Per Tablet", "3");
    expect(setAttributes).toHaveBeenCalledWith({ slidesPerTablet: 3 });

    changeSlider("Slides Per Desktop", "4");
    expect(setAttributes).toHaveBeenCalledWith({ slidesPerDesktop: 4 });
  });

  it("toggles scrollbar and loop", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Scrollbar" }));
    expect(setAttributes).toHaveBeenCalledWith({ scrollbar: true });

    await user.click(screen.getByRole("checkbox", { name: "Loop" }));
    expect(setAttributes).toHaveBeenCalledWith({ loop: true });
  });

  it("toggles centered slides and reveals the side-peek and max-width controls", async () => {
    const user = userEvent.setup();
    const { setAttributes, rerender } = renderEdit();

    expect(screen.queryByRole("slider", { name: "Side peek (%)" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Max slide width")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Centered slides (peek effect)" }));
    expect(setAttributes).toHaveBeenCalledWith({ centerSlides: true });

    rerender(
      <Edit
        attributes={{ ...baseAttributes(), centerSlides: true }}
        setAttributes={setAttributes}
      />
    );
    expect(screen.getByRole("slider", { name: "Side peek (%)" })).toBeInTheDocument();
    expect(screen.getByLabelText("Max slide width")).toBeInTheDocument();
  });

  it("updates the side peek percentage", () => {
    const { setAttributes } = renderEdit({ centerSlides: true });

    const slider = screen.getByRole("slider", { name: "Side peek (%)" });
    fireEvent.change(slider, { target: { value: "30" } });

    expect(setAttributes).toHaveBeenCalledWith({ peek: 30 });
  });

  it("updates the max slide width, preserving the selected unit", () => {
    const { setAttributes } = renderEdit({ centerSlides: true });

    const input = screen.getByLabelText("Max slide width");
    fireEvent.change(input, { target: { value: "700" } });

    expect(setAttributes).toHaveBeenCalledWith({ slideMaxWidth: "700px" });
  });

  it("normalizes a legacy numeric slideMaxWidth (pre-UnitControl content) to a px string for display", () => {
    renderEdit({ centerSlides: true, slideMaxWidth: 700 as unknown as string });

    expect(screen.getByLabelText("Max slide width")).toHaveValue(700);
  });

  it("updates the space between slides", () => {
    const { setAttributes } = renderEdit();

    const slider = screen.getByRole("slider", { name: "Space Between Slides (px)" });
    fireEvent.change(slider, { target: { value: "40" } });

    expect(setAttributes).toHaveBeenCalledWith({ spaceBetween: 40 });
  });

  it("toggles mousewheel and keyboard navigation", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Mousewheel" }));
    expect(setAttributes).toHaveBeenCalledWith({ mousewheel: true });

    await user.click(screen.getByRole("checkbox", { name: "Keyboard Navigation" }));
    expect(setAttributes).toHaveBeenCalledWith({ keyboard: true });
  });
});
