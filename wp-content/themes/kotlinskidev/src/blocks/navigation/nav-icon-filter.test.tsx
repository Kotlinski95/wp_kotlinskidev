import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  allowedTypes: string[];
  render: (props: { open: () => void }) => React.ReactNode;
}

let lastMediaUploadProps: MediaUploadProps | null = null;
const mockOpen = jest.fn();

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    lastMediaUploadProps = props;
    return <>{props.render({ open: mockOpen })}</>;
  },
}));

import "./nav-icon-filter";

describe("nav-icon-filter — blocks.registerBlockType filter", () => {
  it("leaves settings unchanged for a block that is not a navigation link/submenu", () => {
    const settings = { attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings, "core/paragraph")).toBe(settings);
  });

  it.each(["core/navigation-link", "core/navigation-submenu"])(
    "adds navIconId and navIconUrl attributes for %s",
    (blockName) => {
      const settings = { attributes: {} };

      const result = applyFilters("blocks.registerBlockType", settings, blockName) as {
        attributes: {
          navIconId: { type: string; default: number };
          navIconUrl: { type: string; default: string };
        };
      };

      expect(result.attributes.navIconId).toEqual({ type: "integer", default: 0 });
      expect(result.attributes.navIconUrl).toEqual({ type: "string", default: "" });
    }
  );
});

describe("nav-icon-filter — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { navIconId?: number; navIconUrl?: string };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  afterEach(() => {
    lastMediaUploadProps = null;
    jest.clearAllMocks();
  });

  it("renders only the original edit for an unsupported block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Nav Icon")).not.toBeInTheDocument();
  });

  it("shows a select button and no preview when there is no icon yet", () => {
    renderWrapped({ name: "core/navigation-link", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByRole("button", { name: "Select SVG icon" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove icon" })).not.toBeInTheDocument();
  });

  it("shows the icon preview, replace, and remove buttons once an icon is set", () => {
    const { container } = renderWrapped({
      name: "core/navigation-submenu",
      attributes: { navIconId: 3, navIconUrl: "icon.svg" },
      setAttributes: jest.fn(),
    });

    expect(container.querySelector('img[src="icon.svg"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Replace icon" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove icon" })).toBeInTheDocument();
  });

  it("only allows SVG uploads", () => {
    renderWrapped({ name: "core/navigation-link", attributes: {}, setAttributes: jest.fn() });

    expect(lastMediaUploadProps?.allowedTypes).toEqual(["image/svg+xml"]);
  });

  it("opens the media library on select-button click", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/navigation-link", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: "Select SVG icon" }));

    expect(mockOpen).toHaveBeenCalled();
  });

  it("sets navIconId/navIconUrl once media is selected", () => {
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/navigation-link", attributes: {}, setAttributes });

    lastMediaUploadProps?.onSelect({ id: 7, url: "chosen.svg" });

    expect(setAttributes).toHaveBeenCalledWith({ navIconId: 7, navIconUrl: "chosen.svg" });
  });

  it("clears the icon attributes when removed", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      attributes: { navIconId: 3, navIconUrl: "icon.svg" },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: "Remove icon" }));

    expect(setAttributes).toHaveBeenCalledWith({ navIconId: 0, navIconUrl: "" });
  });
});
