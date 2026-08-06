import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createReduxStore, register } from "@wordpress/data";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface RegisteredSettings {
  attributes: Record<string, { type: string; default: unknown }>;
  edit: ComponentType<{
    attributes: Record<string, unknown>;
    setAttributes: (attrs: Record<string, unknown>) => void;
  }>;
  save: () => unknown;
}

let capturedSettings: RegisteredSettings | null = null;

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: (_name: string, settings: RegisteredSettings) => {
    capturedSettings = settings;
  },
}));

interface NavigationPost {
  id: number;
  slug: string;
  title: { rendered: string };
}

const mockRecords = { current: null as NavigationPost[] | null };

register(
  createReduxStore("core", {
    reducer: (state = {}) => state,
    selectors: {
      getEntityRecords: () => mockRecords.current,
    },
  })
);

require("./index");

function baseAttributes() {
  return {
    menuSlug: "",
    overlayMenu: "never" as const,
    displayMode: "mega" as const,
    visibility: "all" as const,
    overlaySlide: "right" as const,
    hamburgerLineAlign: "right" as const,
    className: "",
    linkNavigatesOnClick: false,
  };
}

describe("navigation registration", () => {
  it("registers with the expected default attributes and a null save", () => {
    expect(capturedSettings?.attributes.menuSlug).toEqual({ type: "string", default: "" });
    expect(capturedSettings?.attributes.overlayMenu).toEqual({ type: "string", default: "never" });
    expect(capturedSettings?.attributes.displayMode).toEqual({ type: "string", default: "mega" });
    expect(capturedSettings?.attributes.linkNavigatesOnClick).toEqual({
      type: "boolean",
      default: false,
    });
    expect(capturedSettings?.save()).toBeNull();
  });
});

describe("navigation Edit", () => {
  beforeEach(() => {
    mockRecords.current = null;
  });

  function renderEdit(overrides: Partial<ReturnType<typeof baseAttributes>> = {}) {
    const Edit = capturedSettings!.edit;
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("shows a loading placeholder option while navigation posts are unresolved", () => {
    renderEdit();

    expect(
      within(screen.getByRole("combobox", { name: "Navigation menu" })).getByText("Loading…")
    ).toBeInTheDocument();
  });

  it("shows a select-a-menu placeholder once posts have resolved to an empty list", () => {
    mockRecords.current = [];
    renderEdit();

    expect(
      within(screen.getByRole("combobox", { name: "Navigation menu" })).getByText(
        "— Select a menu —"
      )
    ).toBeInTheDocument();
  });

  it("lists resolved navigation posts by title", () => {
    mockRecords.current = [{ id: 1, slug: "main-menu", title: { rendered: "Main Menu" } }];
    renderEdit();

    expect(
      within(screen.getByRole("combobox", { name: "Navigation menu" })).getByText("Main Menu")
    ).toBeInTheDocument();
  });

  it("falls back to the slug when a navigation post has no rendered title", () => {
    mockRecords.current = [{ id: 1, slug: "footer-menu", title: { rendered: "" } }];
    renderEdit();

    expect(
      within(screen.getByRole("combobox", { name: "Navigation menu" })).getByText("footer-menu")
    ).toBeInTheDocument();
  });

  it("updates the selected menu slug", async () => {
    mockRecords.current = [{ id: 1, slug: "main-menu", title: { rendered: "Main Menu" } }];
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Navigation menu" }),
      "Main Menu"
    );

    expect(setAttributes).toHaveBeenCalledWith({ menuSlug: "main-menu" });
  });

  it("updates the display mode", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.selectOptions(screen.getByRole("combobox", { name: "Display mode" }), "list");

    expect(setAttributes).toHaveBeenCalledWith({ displayMode: "list" });
  });

  it("updates the overlay mode", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.selectOptions(screen.getByRole("combobox", { name: "Overlay mode" }), "mobile");

    expect(setAttributes).toHaveBeenCalledWith({ overlayMenu: "mobile" });
  });

  it("updates the visibility", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.selectOptions(screen.getByRole("combobox", { name: "Visibility" }), "desktop");

    expect(setAttributes).toHaveBeenCalledWith({ visibility: "desktop" });
  });

  it("applies the visibility class to the wrapper", () => {
    const { container } = renderEdit({ visibility: "mobile" });

    expect(container.firstElementChild).toHaveClass("kt-nav-placeholder", "nav-mobile");
  });

  it("hides the overlay-slide and hamburger-alignment controls unless overlayMenu is always", () => {
    renderEdit({ overlayMenu: "mobile" });

    expect(
      screen.queryByRole("combobox", { name: "Overlay slide direction" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Hamburger short line alignment" })
    ).not.toBeInTheDocument();
  });

  it("shows and wires the overlay-slide and hamburger-alignment controls when overlayMenu is always", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ overlayMenu: "always" });

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Overlay slide direction" }),
      "left"
    );
    expect(setAttributes).toHaveBeenCalledWith({ overlaySlide: "left" });

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Hamburger short line alignment" }),
      "left"
    );
    expect(setAttributes).toHaveBeenCalledWith({ hamburgerLineAlign: "left" });
  });

  it("toggles linkNavigatesOnClick", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Navigate top-level links on click" }));

    expect(setAttributes).toHaveBeenCalledWith({ linkNavigatesOnClick: true });
  });
});
