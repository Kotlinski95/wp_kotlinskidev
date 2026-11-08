import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";

describe("cover-video-controls — blocks.registerBlockType filter", () => {
  it("adds the three video attributes with their defaults to core/cover", () => {
    const result = applyFilters(
      "blocks.registerBlockType",
      { attributes: { url: { type: "string" } } },
      "core/cover"
    ) as { attributes: Record<string, unknown> };

    expect(result.attributes).toMatchObject({
      url: { type: "string" },
      coverVideoAutoplay: { type: "boolean", default: true },
      coverVideoLoop: { type: "boolean", default: true },
      coverVideoPauseOffscreen: { type: "boolean", default: false },
      coverVideoRevealAfterEnd: { type: "boolean", default: false },
      coverVideoFitAspect: { type: "boolean", default: false },
    });
  });

  it("leaves other blocks untouched", () => {
    const settings = { attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings, "core/group")).toBe(settings);
  });
});

describe("cover-video-controls — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: Record<string, unknown>;
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("shows no panel for a cover with an image background", () => {
    renderWrapped({
      name: "core/cover",
      attributes: { backgroundType: "image" },
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Video background")).not.toBeInTheDocument();
  });

  it("shows no panel for a non-cover block", () => {
    renderWrapped({
      name: "core/group",
      attributes: { backgroundType: "video" },
      setAttributes: jest.fn(),
    });

    expect(screen.queryByText("Video background")).not.toBeInTheDocument();
  });

  it("shows the three toggles with default states for a video cover", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/cover",
      attributes: { backgroundType: "video" },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Video background/ }));

    expect(screen.getByRole("checkbox", { name: /Autoplay/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Loop/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Pause when offscreen/ })).not.toBeChecked();
  });

  it("saves the attribute when Loop is switched off", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/cover", attributes: { backgroundType: "video" }, setAttributes });

    await user.click(screen.getByRole("button", { name: /Video background/ }));
    await user.click(screen.getByRole("checkbox", { name: /Loop/ }));

    expect(setAttributes).toHaveBeenCalledWith({ coverVideoLoop: false });
    expect(screen.getByText("The video restarts every time it ends.")).toBeInTheDocument();
  });

  it("renders the reveal toggle and saves it when switched on", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/cover", attributes: { backgroundType: "video" }, setAttributes });

    await user.click(screen.getByRole("button", { name: /Video background/ }));
    const toggle = screen.getByRole("checkbox", { name: /Reveal content after video ends/ });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);

    expect(setAttributes).toHaveBeenCalledWith({ coverVideoRevealAfterEnd: true });
  });

  it("renders the fit toggle and saves it when switched on", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/cover", attributes: { backgroundType: "video" }, setAttributes });

    await user.click(screen.getByRole("button", { name: /Video background/ }));
    const toggle = screen.getByRole("checkbox", { name: /Fit cover to video aspect ratio/ });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);

    expect(setAttributes).toHaveBeenCalledWith({ coverVideoFitAspect: true });
  });

  it("disables Loop and shows it off when reveal is on", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/cover",
      attributes: { backgroundType: "video", coverVideoRevealAfterEnd: true },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Video background/ }));
    const loop = screen.getByRole("checkbox", { name: /Loop/ });

    expect(loop).toBeDisabled();
    expect(loop).not.toBeChecked();
    expect(
      screen.getByText("Loop is off while content is revealed after the video ends.")
    ).toBeInTheDocument();
  });
});
