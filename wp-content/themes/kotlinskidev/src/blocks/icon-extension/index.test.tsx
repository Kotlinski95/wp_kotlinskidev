import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

let mockMediaUploadCalls: MediaUploadProps[] = [];
const mockOpen = jest.fn();

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    mockMediaUploadCalls.push(props);
    return <>{props.render({ open: mockOpen })}</>;
  },
}));

import "./index";

describe("icon-extension — blocks.registerBlockType filter", () => {
  it("leaves an unrelated block unchanged", () => {
    const settings = { name: "core/paragraph", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it.each([
    "kotlinskidev/button",
    "kotlinskidev/nav-link",
    "core/button",
    "core/navigation-link",
    "core/navigation-submenu",
  ])("adds iconId and iconUrl attributes to %s", (name) => {
    const settings = { name, attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { iconId: unknown; iconUrl: unknown };
    };

    expect(result.attributes.iconId).toEqual({ type: "number", default: 0 });
    expect(result.attributes.iconUrl).toEqual({ type: "string", default: "" });
  });
});

describe("icon-extension — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: { iconId?: number; iconUrl?: string };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpen.mockClear();
  });

  it("renders only the original edit for an unrelated block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Select SVG icon" })).not.toBeInTheDocument();
  });

  it("renders the icon picker for kotlinskidev/button", () => {
    renderWrapped({ name: "kotlinskidev/button", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select SVG icon" })).toBeInTheDocument();
  });

  it("shows a Replace icon button once an icon is set", () => {
    renderWrapped({
      name: "core/navigation-link",
      attributes: { iconId: 3, iconUrl: "https://example.test/star.svg" },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("button", { name: "Replace icon" })).toBeInTheDocument();
  });

  it("calls setAttributes with the selected icon id and url", () => {
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/button", attributes: {}, setAttributes });

    mockMediaUploadCalls[0].onSelect({ id: 6, url: "https://example.test/arrow.svg" });

    expect(setAttributes).toHaveBeenCalledWith({
      iconId: 6,
      iconUrl: "https://example.test/arrow.svg",
    });
  });

  it("removes the icon when Remove icon is clicked", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-submenu",
      attributes: { iconId: 3, iconUrl: "https://example.test/star.svg" },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Remove icon" }));

    expect(setAttributes).toHaveBeenCalledWith({ iconId: 0, iconUrl: "" });
  });
});
