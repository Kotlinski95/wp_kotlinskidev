import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";

jest.mock("./assets/image1.webp", () => "image1.webp", { virtual: true });
jest.mock("./assets/image2.webp", () => "image2.webp", { virtual: true });
jest.mock("./assets/image3.webp", () => "image3.webp", { virtual: true });

const mockInsertBlock = jest.fn();
const mockSelectBlock = jest.fn();
const mockBlocks: Record<string, { innerBlocks: Array<{ clientId: string }> } | undefined> = {};

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

jest.mock("@wordpress/compose", () => ({
  useRefEffect: () => null,
}));

const mockCreateBlock = jest.fn((name: string) => ({ name, clientId: "new-slide" }));

jest.mock("@wordpress/blocks", () => ({
  createBlock: (...args: unknown[]) => mockCreateBlock(...(args as [string])),
}));

jest.mock("./swiper-init", () => ({ SwiperInit: jest.fn() }));

import Edit from "./edit";
import { DEFAULT_BLOCK } from "./constants";

function baseAttributes() {
  return {
    autoplay: false,
    autoplayTime: 5,
    smoothTransition: false,
    navigation: true,
    pagination: true,
    slidesPerView: 1,
    slidesPerMobile: 1,
    slidesPerTablet: 2,
    slidesPerDesktop: 3,
    scrollbar: false,
    loop: false,
    mousewheel: false,
    keyboard: false,
    spaceBetween: 10,
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

  it("toggles smooth transition, which changes the autoplay-time help text", () => {
    const { rerender } = renderEdit({ smoothTransition: false });
    expect(screen.getByText("Set the autoplay interval in seconds.")).toBeInTheDocument();

    rerender(
      <Edit
        attributes={{ ...baseAttributes(), smoothTransition: true }}
        setAttributes={jest.fn()}
      />
    );
    expect(screen.getByText("Set the smooth scrolling speed in seconds.")).toBeInTheDocument();
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
