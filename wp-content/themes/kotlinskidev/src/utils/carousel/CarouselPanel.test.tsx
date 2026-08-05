import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@wordpress/block-editor", () => ({
  __experimentalColorGradientControl: () => null,
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
});
