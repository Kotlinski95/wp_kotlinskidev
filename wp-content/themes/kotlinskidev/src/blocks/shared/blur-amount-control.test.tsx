import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlurAmountControl } from "./blur-amount-control";

jest.mock("@wordpress/block-editor", () => ({
  useSettings: () => [{ hairline: "0.0625rem", strong: "0.75rem" }],
}));

describe("BlurAmountControl", () => {
  it("defaults to the Default option when value is empty", () => {
    render(<BlurAmountControl value="" onChange={jest.fn()} />);

    expect(screen.getByLabelText("Blur intensity")).toHaveValue("");
  });

  it("lists presets from the custom.gridHoverBlur setting", () => {
    render(<BlurAmountControl value="" onChange={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Hairline" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Strong" })).toBeInTheDocument();
  });

  it("calls onChange with the preset CSS var when a preset is selected", () => {
    const onChange = jest.fn();
    render(<BlurAmountControl value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Blur intensity"), {
      target: { value: "hairline" },
    });

    expect(onChange).toHaveBeenCalledWith("var(--wp--custom--grid-hover-blur--hairline)");
  });

  it("shows the custom text field and preserves its value when Custom is selected", () => {
    const onChange = jest.fn();
    render(<BlurAmountControl value="0.5rem" onChange={onChange} />);

    expect(screen.getByLabelText("Blur intensity")).toHaveValue("custom");
    expect(screen.getByLabelText("Custom blur amount")).toHaveValue("0.5rem");
  });

  it("calls onChange with the typed value from the custom text field", () => {
    const onChange = jest.fn();
    render(<BlurAmountControl value="0.5rem" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Custom blur amount"), {
      target: { value: "1rem" },
    });

    expect(onChange).toHaveBeenCalledWith("1rem");
  });

  it("resets to the default value when Default is reselected", () => {
    const onChange = jest.fn();
    render(<BlurAmountControl value="0.5rem" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Blur intensity"), {
      target: { value: "" },
    });

    expect(onChange).toHaveBeenCalledWith("");
  });
});
