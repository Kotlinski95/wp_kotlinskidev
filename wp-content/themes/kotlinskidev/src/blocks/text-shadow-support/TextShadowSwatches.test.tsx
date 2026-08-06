import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSettings } from "@wordpress/block-editor";

jest.mock("@wordpress/block-editor", () => ({
  useSettings: jest.fn(),
}));

import { TextShadowSwatches } from "./TextShadowSwatches";

function mockPresets(presets?: Record<string, string>) {
  (useSettings as jest.Mock).mockReturnValue([presets]);
}

describe("TextShadowSwatches", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("always renders a None option first", () => {
    mockPresets(undefined);

    render(<TextShadowSwatches value="none" onChange={jest.fn()} />);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveAccessibleName("None");
  });

  it("renders one option per preset, converting its slug to a title-case label", () => {
    mockPresets({ "adaptive-strong": "0 0 4px black", subtle: "0 0 2px gray" });

    render(<TextShadowSwatches value="none" onChange={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Adaptive Strong" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Subtle" })).toBeInTheDocument();
  });

  it("marks the option matching the current value as selected", () => {
    mockPresets({ subtle: "0 0 2px gray" });

    render(
      <TextShadowSwatches value="var(--wp--custom--text-shadow--subtle)" onChange={jest.fn()} />
    );

    expect(screen.getByRole("option", { name: "Subtle" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "None" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange with the preset's CSS variable value when clicked", async () => {
    mockPresets({ subtle: "0 0 2px gray" });
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<TextShadowSwatches value="none" onChange={onChange} />);
    await user.click(screen.getByRole("option", { name: "Subtle" }));

    expect(onChange).toHaveBeenCalledWith("var(--wp--custom--text-shadow--subtle)");
  });

  it("calls onChange with 'none' when the None option is clicked", async () => {
    mockPresets({ subtle: "0 0 2px gray" });
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(
      <TextShadowSwatches value="var(--wp--custom--text-shadow--subtle)" onChange={onChange} />
    );
    await user.click(screen.getByRole("option", { name: "None" }));

    expect(onChange).toHaveBeenCalledWith("none");
  });
});
