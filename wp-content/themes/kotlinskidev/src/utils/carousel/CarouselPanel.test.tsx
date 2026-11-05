import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MockColorGradientControlProps {
  onColorChange: (value: string | undefined) => void;
  onGradientChange: (value: string | undefined) => void;
}

jest.mock("@wordpress/block-editor", () => ({
  __experimentalColorGradientControl: ({
    onColorChange,
    onGradientChange,
  }: MockColorGradientControlProps) => (
    <div>
      <button onClick={() => onColorChange("purple")}>set-color</button>
      <button onClick={() => onColorChange(undefined)}>clear-color</button>
      <button onClick={() => onGradientChange(undefined)}>clear-gradient-companion</button>
    </div>
  ),
}));

import CarouselPanel from "./CarouselPanel";

describe("CarouselPanel", () => {
  it("renders the always-on controls with values from settings", () => {
    render(
      <CarouselPanel settings={{ showArrows: true, showPagination: false }} onChange={jest.fn()} />
    );

    expect(screen.getByRole("checkbox", { name: "Show Arrows" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Show Pagination" })).not.toBeChecked();
  });

  it("calls onChange with the toggled value when a control is clicked", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<CarouselPanel settings={{ showPagination: true }} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Show Pagination" }));

    expect(onChange).toHaveBeenCalledWith({ showPagination: false });
  });

  it("hides feature-gated controls when the feature flag is not passed", () => {
    render(<CarouselPanel settings={{}} onChange={jest.fn()} features={{}} />);

    expect(screen.queryByRole("checkbox", { name: "Show Scrollbar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Autoplay" })).not.toBeInTheDocument();
  });

  it("shows feature-gated controls once the matching feature flag is enabled", () => {
    render(
      <CarouselPanel
        settings={{}}
        onChange={jest.fn()}
        features={{ scrollbar: true, autoplay: true }}
      />
    );

    expect(screen.getByRole("checkbox", { name: "Show Scrollbar" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Autoplay" })).toBeInTheDocument();
  });

  it("only reveals the autoplay delay control once autoplay is on", () => {
    const { rerender } = render(
      <CarouselPanel
        settings={{ autoplay: false }}
        onChange={jest.fn()}
        features={{ autoplay: true }}
      />
    );

    expect(
      screen.queryByRole("slider", { name: "Autoplay Delay (seconds)" })
    ).not.toBeInTheDocument();

    rerender(
      <CarouselPanel
        settings={{ autoplay: true }}
        onChange={jest.fn()}
        features={{ autoplay: true }}
      />
    );

    expect(screen.getByRole("slider", { name: "Autoplay Delay (seconds)" })).toBeInTheDocument();
  });

  it("uses a custom title when one is provided", () => {
    render(<CarouselPanel settings={{}} onChange={jest.fn()} title="Slider Settings" />);

    expect(screen.getByText("Slider Settings")).toBeInTheDocument();
    expect(screen.queryByText("Carousel Settings")).not.toBeInTheDocument();
  });

  it("shows the arrows-position select only when arrows are shown and the feature is enabled", () => {
    const { rerender } = render(
      <CarouselPanel
        settings={{ showArrows: false }}
        onChange={jest.fn()}
        features={{ arrowsPosition: true }}
      />
    );
    expect(screen.queryByRole("combobox", { name: "Arrows Position" })).not.toBeInTheDocument();

    rerender(
      <CarouselPanel
        settings={{ showArrows: true }}
        onChange={jest.fn()}
        features={{ arrowsPosition: true }}
      />
    );
    expect(screen.getByRole("combobox", { name: "Arrows Position" })).toBeInTheDocument();
  });

  it("updates arrowsPosition when the select changes", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{ showArrows: true }}
        onChange={onChange}
        features={{ arrowsPosition: true }}
      />
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Arrows Position" }),
      "bottom-left"
    );

    expect(onChange).toHaveBeenCalledWith({ arrowsPosition: "bottom-left" });
  });

  it("shows the nav-placement toggle only once arrows are moved off the default sides position", () => {
    render(
      <CarouselPanel
        settings={{ showArrows: true, arrowsPosition: "bottom-left" }}
        onChange={jest.fn()}
        features={{ navPlacement: true }}
      />
    );

    expect(
      screen.getByRole("checkbox", { name: "Show navigation outside carousel" })
    ).toBeInTheDocument();
  });

  it("does not show the nav-placement toggle while arrows are in the default sides position", () => {
    render(
      <CarouselPanel
        settings={{ showArrows: true, arrowsPosition: "sides" }}
        onChange={jest.fn()}
        features={{ navPlacement: true }}
      />
    );

    expect(
      screen.queryByRole("checkbox", { name: "Show navigation outside carousel" })
    ).not.toBeInTheDocument();
  });

  it("toggles navPlacement between outside and inside", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{ showArrows: true, arrowsPosition: "bottom-left", navPlacement: "inside" }}
        onChange={onChange}
        features={{ navPlacement: true }}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "Show navigation outside carousel" }));

    expect(onChange).toHaveBeenCalledWith({ navPlacement: "outside" });
  });

  it("shows the pagination-placement toggle only once pagination is on and the feature is enabled", () => {
    const { rerender } = render(
      <CarouselPanel
        settings={{ showPagination: false }}
        onChange={jest.fn()}
        features={{ paginationPlacement: true }}
      />
    );
    expect(
      screen.queryByRole("checkbox", { name: "Show pagination outside carousel" })
    ).not.toBeInTheDocument();

    rerender(
      <CarouselPanel
        settings={{ showPagination: true }}
        onChange={jest.fn()}
        features={{ paginationPlacement: true }}
      />
    );
    expect(
      screen.getByRole("checkbox", { name: "Show pagination outside carousel" })
    ).toBeInTheDocument();
  });

  it("does not show the pagination-placement toggle when the feature flag is off", () => {
    render(
      <CarouselPanel settings={{ showPagination: true }} onChange={jest.fn()} features={{}} />
    );

    expect(
      screen.queryByRole("checkbox", { name: "Show pagination outside carousel" })
    ).not.toBeInTheDocument();
  });

  it("toggles paginationPlacement between outside and inside", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{ showPagination: true, paginationPlacement: "inside" }}
        onChange={onChange}
        features={{ paginationPlacement: true }}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "Show pagination outside carousel" }));

    expect(onChange).toHaveBeenCalledWith({ paginationPlacement: "outside" });
  });

  it("shows the nav color control when the feature is on and arrows or pagination are visible", () => {
    render(
      <CarouselPanel
        settings={{ showArrows: true, showPagination: false }}
        onChange={jest.fn()}
        features={{ navColor: true }}
      />
    );

    expect(screen.getByRole("button", { name: "set-color" })).toBeInTheDocument();
  });

  it("reports a picked color through onChange", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{ showArrows: true }}
        onChange={onChange}
        features={{ navColor: true }}
      />
    );

    await user.click(screen.getByRole("button", { name: "set-color" }));

    expect(onChange).toHaveBeenCalledWith({ navColor: "purple" });
  });

  it("swallows the undefined companion callback that immediately follows a picked color", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{ showArrows: true }}
        onChange={onChange}
        features={{ navColor: true }}
      />
    );

    await user.click(screen.getByRole("button", { name: "set-color" }));
    await user.click(screen.getByRole("button", { name: "clear-gradient-companion" }));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("clears navColor when the control reports undefined with no pending color", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{ showArrows: true }}
        onChange={onChange}
        features={{ navColor: true }}
      />
    );

    await user.click(screen.getByRole("button", { name: "clear-color" }));

    expect(onChange).toHaveBeenCalledWith({ navColor: "" });
  });

  it("shows the color-on-hover toggle only once a nav color is set", () => {
    const { rerender } = render(
      <CarouselPanel
        settings={{ showArrows: true, navColor: "" }}
        onChange={jest.fn()}
        features={{ navColor: true }}
      />
    );
    expect(screen.queryByRole("checkbox", { name: "Color on hover only" })).not.toBeInTheDocument();

    rerender(
      <CarouselPanel
        settings={{ showArrows: true, navColor: "#8209d3" }}
        onChange={jest.fn()}
        features={{ navColor: true }}
      />
    );
    expect(screen.getByRole("checkbox", { name: "Color on hover only" })).toBeInTheDocument();
  });

  it("toggles navColorOnHover", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{ showArrows: true, navColor: "#8209d3" }}
        onChange={onChange}
        features={{ navColor: true }}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "Color on hover only" }));

    expect(onChange).toHaveBeenCalledWith({ navColorOnHover: true });
  });

  it("toggles lazyLoad and trackActiveSlide when their features are enabled", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <CarouselPanel
        settings={{}}
        onChange={onChange}
        features={{ lazyLoad: true, trackActiveSlide: true }}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "Lazy Load First Image" }));
    expect(onChange).toHaveBeenCalledWith({ lazyLoad: true });

    await user.click(screen.getByRole("checkbox", { name: "Track active slide" }));
    expect(onChange).toHaveBeenCalledWith({ trackActiveSlide: true });
  });

  it("updates each per-breakpoint slides-per-view range control", () => {
    const onChange = jest.fn();
    render(
      <CarouselPanel settings={{}} onChange={onChange} features={{ slidesPerBreakpoint: true }} />
    );

    fireEvent.change(screen.getByRole("slider", { name: "Slides Per View" }), {
      target: { value: "3" },
    });
    expect(onChange).toHaveBeenCalledWith({ slidesPerView: 3 });

    fireEvent.change(screen.getByRole("slider", { name: "Slides (Mobile)" }), {
      target: { value: "2" },
    });
    expect(onChange).toHaveBeenCalledWith({ slidesPerMobile: 2 });

    fireEvent.change(screen.getByRole("slider", { name: "Slides (Tablet)" }), {
      target: { value: "2" },
    });
    expect(onChange).toHaveBeenCalledWith({ slidesPerTablet: 2 });

    fireEvent.change(screen.getByRole("slider", { name: "Slides (Desktop)" }), {
      target: { value: "4" },
    });
    expect(onChange).toHaveBeenCalledWith({ slidesPerDesktop: 4 });
  });

  it("toggles draggable", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<CarouselPanel settings={{ draggable: true }} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Draggable" }));

    expect(onChange).toHaveBeenCalledWith({ draggable: false });
  });

  it("converts the autoplay delay slider value between seconds and milliseconds", () => {
    const onChange = jest.fn();
    render(
      <CarouselPanel
        settings={{ autoplay: true, autoplayDelay: 5000 }}
        onChange={onChange}
        features={{ autoplay: true }}
      />
    );

    const slider = screen.getByRole("slider", { name: "Autoplay Delay (seconds)" });
    expect(slider).toHaveValue("5");

    fireEvent.change(slider, { target: { value: "7" } });

    expect(onChange).toHaveBeenCalledWith({ autoplayDelay: 7000 });
  });
});
