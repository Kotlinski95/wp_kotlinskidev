import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: ({
    render: renderTrigger,
    onSelect,
  }: {
    render: (args: { open: () => void }) => React.ReactNode;
    onSelect: (media: { id: number; url: string }) => void;
  }) => (
    <>
      {renderTrigger({ open: () => onSelect({ id: 7, url: "https://x.test/uploads/mobile.mp4" }) })}
    </>
  ),
}));

import { resolveResponsiveMedia } from "./index";

describe("resolveResponsiveMedia", () => {
  it("falls back to desktop when no slot is set", () => {
    expect(resolveResponsiveMedia("d.mp4", {})).toEqual({
      desktop: "d.mp4",
      tablet: "d.mp4",
      mobile: "d.mp4",
    });
  });

  it("lets mobile fall back to tablet before desktop", () => {
    expect(resolveResponsiveMedia("d.mp4", { tablet: { url: "t.mp4" } })).toEqual({
      desktop: "d.mp4",
      tablet: "t.mp4",
      mobile: "t.mp4",
    });
  });
});

describe("responsive-media — blocks.registerBlockType filter", () => {
  it("adds an empty responsiveMedia object attribute to core/cover only", () => {
    const cover = applyFilters(
      "blocks.registerBlockType",
      { attributes: { url: { type: "string" } } },
      "core/cover"
    ) as {
      attributes: Record<string, unknown>;
    };
    const group = { attributes: {} };

    expect(cover.attributes).toMatchObject({
      url: { type: "string" },
      responsiveMedia: { type: "object", default: {} },
    });
    expect(applyFilters("blocks.registerBlockType", group, "core/group")).toBe(group);
  });
});

describe("responsive-media — editor.BlockEdit filter", () => {
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

  it("shows no panel for other blocks or a cover without media", () => {
    renderWrapped({ name: "core/group", attributes: { url: "d.mp4" }, setAttributes: jest.fn() });
    renderWrapped({ name: "core/cover", attributes: {}, setAttributes: jest.fn() });

    expect(screen.queryByText("Responsive media")).not.toBeInTheDocument();
  });

  it("saves the picked media into the mobile slot", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/cover",
      attributes: { url: "https://x.test/desktop.mp4", backgroundType: "video" },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: /Responsive media/ }));
    await user.click(screen.getAllByRole("button", { name: "Select media" })[0]);

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveMedia: { mobile: { id: 7, url: "https://x.test/uploads/mobile.mp4" } },
    });
  });

  it("removes a filled slot and keeps the other one", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/cover",
      attributes: {
        url: "https://x.test/desktop.mp4",
        backgroundType: "video",
        responsiveMedia: {
          mobile: { url: "https://x.test/m.mp4" },
          tablet: { url: "https://x.test/t.mp4" },
        },
      },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: /Responsive media/ }));
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(setAttributes).toHaveBeenCalledWith({
      responsiveMedia: { tablet: { url: "https://x.test/t.mp4" } },
    });
  });

  it("summarises which file each device uses", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/cover",
      attributes: {
        url: "https://x.test/desktop.mp4",
        backgroundType: "video",
        responsiveMedia: { mobile: { url: "https://x.test/vertical.mp4" } },
      },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Responsive media/ }));

    expect(screen.getByText(/Mobile uses:/)).toHaveTextContent("vertical.mp4");
    expect(screen.getByText(/Desktop uses:/)).toHaveTextContent("Cover media");
  });
});
