import React from "react";
import { render, screen } from "@testing-library/react";
import SlidesPerViewControl from "./SlidesPerViewControl";

describe("SlidesPerViewControl", () => {
  it("steps by 1 by default", () => {
    render(<SlidesPerViewControl label="Per view" value={2} onChange={jest.fn()} />);

    expect(screen.getAllByRole("slider", { name: "Per view" })[0]).toHaveAttribute("step", "1");
  });

  it("accepts a fractional step", () => {
    render(<SlidesPerViewControl label="Per view" value={1.75} step={0.25} onChange={jest.fn()} />);

    expect(screen.getAllByRole("slider", { name: "Per view" })[0]).toHaveAttribute("step", "0.25");
  });
});
