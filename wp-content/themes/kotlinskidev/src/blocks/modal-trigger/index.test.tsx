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

describe("modal-trigger — blocks.registerBlockType filter", () => {
  it("leaves an unrelated block unchanged", () => {
    const settings = { name: "core/paragraph", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds opensInModal and modalId attributes to kotlinskidev/button", () => {
    const settings = { name: "kotlinskidev/button", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        opensInModal: { type: string; default: boolean };
        modalId: { type: string; default: number };
      };
    };

    expect(result.attributes.opensInModal).toEqual({ type: "boolean", default: false });
    expect(result.attributes.modalId).toEqual({ type: "number", default: 0 });
  });

  it("adds opensInModal and modalId attributes to kotlinskidev/nav-link", () => {
    const settings = { name: "kotlinskidev/nav-link", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: { opensInModal: unknown };
    };

    expect(result.attributes.opensInModal).toBeDefined();
  });

  it.each(["core/button", "core/navigation-link", "core/navigation-submenu"])(
    "adds opensInModal and modalId attributes to %s",
    (name) => {
      const settings = { name, attributes: {} };

      const result = applyFilters("blocks.registerBlockType", settings) as {
        attributes: { opensInModal: unknown; modalId: unknown };
      };

      expect(result.attributes.opensInModal).toBeDefined();
      expect(result.attributes.modalId).toBeDefined();
    }
  );
});

describe("modal-trigger — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: { opensInModal?: boolean; modalId?: number };
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
    expect(screen.queryByLabelText("Open in a modal")).not.toBeInTheDocument();
  });

  it("renders the modal toggle for kotlinskidev/button, off by default", () => {
    renderWrapped({ name: "kotlinskidev/button", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByLabelText("Open in a modal")).not.toBeChecked();
    expect(screen.queryByRole("combobox", { name: "Modal" })).not.toBeInTheDocument();
  });

  it("shows the modal picker once the toggle is on", () => {
    renderWrapped({
      name: "kotlinskidev/nav-link",
      attributes: { opensInModal: true },
      setAttributes: jest.fn(),
    });

    expect(screen.getByLabelText("Open in a modal")).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Modal" })).toBeInTheDocument();
  });

  it("lists published modals by title in the picker", () => {
    mockRecords.current = [
      { id: 5, title: { rendered: "Newsletter Signup" } },
      { id: 6, title: { rendered: "" } },
    ];

    renderWrapped({
      name: "kotlinskidev/button",
      attributes: { opensInModal: true },
      setAttributes: jest.fn(),
    });

    expect(screen.getByRole("option", { name: "Newsletter Signup" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "6" })).toBeInTheDocument();
  });

  it("toggling on sets opensInModal", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({ name: "kotlinskidev/button", attributes: {}, setAttributes });

    await user.click(screen.getByLabelText("Open in a modal"));

    expect(setAttributes).toHaveBeenCalledWith({ opensInModal: true });
  });

  it("selecting a modal sets modalId as a number", async () => {
    mockRecords.current = [{ id: 5, title: { rendered: "Newsletter Signup" } }];
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "kotlinskidev/nav-link",
      attributes: { opensInModal: true },
      setAttributes,
    });

    await user.selectOptions(screen.getByRole("combobox", { name: "Modal" }), "5");

    expect(setAttributes).toHaveBeenCalledWith({ modalId: 5 });
  });
});
