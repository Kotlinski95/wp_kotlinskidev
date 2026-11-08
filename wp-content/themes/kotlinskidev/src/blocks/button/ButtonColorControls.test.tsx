import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MockControlProps {
  label: string;
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (value?: string) => void;
  onGradientChange: (value?: string) => void;
}

jest.mock("../shared/color-gradient-control", () => ({
  ColorGradientControl: ({
    label,
    colorValue,
    gradientValue,
    onColorChange,
    onGradientChange,
  }: MockControlProps) => (
    <div data-testid={`row-${label}`}>
      <span data-testid={`color-${label}`}>{colorValue ?? "none"}</span>
      <span data-testid={`gradient-${label}`}>{gradientValue ?? "none"}</span>
      <button onClick={() => onColorChange("#ff0000")}>set-color-{label}</button>
      <button onClick={() => onColorChange(undefined)}>clear-color-{label}</button>
      <button onClick={() => onGradientChange("linear-gradient(red, blue)")}>
        set-gradient-{label}
      </button>
    </div>
  ),
}));

import { ButtonColorPanel } from "./ButtonColorControls";

function buildPair(overrides: Partial<{ color: string; gradient: string }> = {}) {
  return {
    color: "",
    gradient: "",
    onColorChange: jest.fn(),
    onGradientChange: jest.fn(),
    ...overrides,
  };
}

describe("ButtonColorPanel", () => {
  it("renders a row for text, background, and border", () => {
    render(
      <ButtonColorPanel
        title="Colors"
        initialOpen
        text={buildPair()}
        background={buildPair()}
        border={buildPair()}
      />
    );

    expect(screen.getByTestId("row-Text")).toBeInTheDocument();
    expect(screen.getByTestId("row-Background")).toBeInTheDocument();
    expect(screen.getByTestId("row-Border")).toBeInTheDocument();
  });

  it("passes the current color and gradient values through to each row", () => {
    render(
      <ButtonColorPanel
        title="Colors"
        initialOpen
        text={buildPair({ color: "#111111" })}
        background={buildPair({ gradient: "linear-gradient(red, blue)" })}
        border={buildPair()}
      />
    );

    expect(screen.getByTestId("color-Text")).toHaveTextContent("#111111");
    expect(screen.getByTestId("gradient-Background")).toHaveTextContent(
      "linear-gradient(red, blue)"
    );
    expect(screen.getByTestId("color-Border")).toHaveTextContent("none");
  });

  it("treats an empty color/gradient string as undefined", () => {
    render(
      <ButtonColorPanel
        title="Colors"
        initialOpen
        text={buildPair({ color: "" })}
        background={buildPair()}
        border={buildPair()}
      />
    );

    expect(screen.getByTestId("color-Text")).toHaveTextContent("none");
  });

  it("forwards a picked color to the pair's onColorChange", async () => {
    const text = buildPair();
    const user = userEvent.setup();
    render(
      <ButtonColorPanel
        title="Colors"
        initialOpen
        text={text}
        background={buildPair()}
        border={buildPair()}
      />
    );

    await user.click(screen.getByRole("button", { name: "set-color-Text" }));

    expect(text.onColorChange).toHaveBeenCalledWith("#ff0000");
  });

  it("falls back to an empty string when the color is cleared", async () => {
    const text = buildPair();
    const user = userEvent.setup();
    render(
      <ButtonColorPanel
        title="Colors"
        initialOpen
        text={text}
        background={buildPair()}
        border={buildPair()}
      />
    );

    await user.click(screen.getByRole("button", { name: "clear-color-Text" }));

    expect(text.onColorChange).toHaveBeenCalledWith("");
  });

  it("forwards a picked gradient to the pair's onGradientChange", async () => {
    const background = buildPair();
    const user = userEvent.setup();
    render(
      <ButtonColorPanel
        title="Colors"
        initialOpen
        text={buildPair()}
        background={background}
        border={buildPair()}
      />
    );

    await user.click(screen.getByRole("button", { name: "set-gradient-Background" }));

    expect(background.onGradientChange).toHaveBeenCalledWith("linear-gradient(red, blue)");
  });

  it("uses the given panel title", () => {
    render(
      <ButtonColorPanel
        title="Button Colors"
        text={buildPair()}
        background={buildPair()}
        border={buildPair()}
      />
    );

    expect(screen.getByText("Button Colors")).toBeInTheDocument();
  });

  it("defaults to a collapsed panel when initialOpen is not specified", () => {
    render(
      <ButtonColorPanel
        title="Colors"
        text={buildPair()}
        background={buildPair()}
        border={buildPair()}
      />
    );

    expect(screen.queryByTestId("row-Text")).not.toBeInTheDocument();
  });
});
