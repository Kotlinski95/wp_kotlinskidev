import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import { createReduxStore, register } from "@wordpress/data";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface ModalPost {
  id: number;
  title: { rendered: string };
}

const mockRecords: { current: ModalPost[] | null } = { current: null };

register(
  createReduxStore("core", {
    reducer: (state = {}) => state,
    selectors: {
      getEntityRecords: () => mockRecords.current,
    },
  })
);

import "./index";

describe("slider-modal-trigger — blocks.registerBlockType filter", () => {
  it("leaves an unrelated block unchanged", () => {
    const settings = { name: "core/paragraph", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds a modalId attribute to core/cover", () => {
    const settings = { name: "core/cover", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { modalId: { type: string; default: number } };
    };

    expect(result.attributes.modalId).toEqual({ type: "number", default: 0 });
  });
});

describe("slider-modal-trigger — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: { className?: string; modalId?: number };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  beforeEach(() => {
    mockRecords.current = null;
  });

  it("renders only the original edit for an unrelated block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByLabelText("Open on click")).not.toBeInTheDocument();
  });

  it("renders only the original edit for a core/cover block not used as a slide", () => {
    renderWrapped({
      name: "core/cover",
      attributes: { className: "is-style-default" },
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByLabelText("Open on click")).not.toBeInTheDocument();
  });

  it("renders the modal picker for a core/cover slide (swiper-slide among other classes)", () => {
    renderWrapped({
      name: "core/cover",
      attributes: { className: "is-style-default swiper-slide" },
      setAttributes: jest.fn(),
    });

    expect(screen.getByLabelText("Open on click")).toBeInTheDocument();
  });

  it("lists published modals by title in the picker", () => {
    mockRecords.current = [
      { id: 5, title: { rendered: "Project Case Study" } },
      { id: 6, title: { rendered: "" } },
    ];

    renderWrapped({
      name: "core/cover",
      attributes: { className: "swiper-slide" },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("option", { name: "Project Case Study" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "6" })).toBeInTheDocument();
  });

  it("selecting a modal sets modalId as a number", async () => {
    mockRecords.current = [{ id: 5, title: { rendered: "Project Case Study" } }];
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/cover",
      attributes: { className: "swiper-slide" },
      setAttributes,
    });

    await user.selectOptions(screen.getByRole("combobox", { name: "Open on click" }), "5");

    expect(setAttributes).toHaveBeenCalledWith({ modalId: 5 });
  });
});
