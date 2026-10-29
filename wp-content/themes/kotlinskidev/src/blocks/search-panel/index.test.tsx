import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: Object.assign(
    ({ template }: { template: unknown[] }) => (
      <div data-testid="inner-blocks" data-template-length={template.length} />
    ),
    { Content: () => <div data-testid="inner-blocks-content" /> }
  ),
}));

jest.mock("../shared/nav-icon-picker", () => ({
  NavIconPicker: ({
    iconUrl,
    onChange,
  }: {
    iconUrl: string;
    onChange: (id: number, url: string) => void;
  }) => (
    <div>
      <span data-testid="icon-url">{iconUrl}</span>
      <button onClick={() => onChange(9, "new-icon.svg")}>pick-icon</button>
    </div>
  ),
}));

import "./index";

function getDefinition() {
  return (registerBlockType as jest.Mock).mock.calls[0][1];
}

describe("search-panel registration", () => {
  it("registers both search-panel and nav-search-panel with the same edit/save", () => {
    const { edit, save } = getDefinition();

    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/search-panel" }),
      expect.objectContaining({ edit, save })
    );
    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: "kotlinskidev/nav-search-panel" }),
      expect.objectContaining({ edit, save })
    );
  });

  it("saves by rendering InnerBlocks.Content", () => {
    const { save: Save } = getDefinition();

    render(<Save />);

    expect(screen.getByTestId("inner-blocks-content")).toBeInTheDocument();
  });
});

describe("SearchPanelEdit", () => {
  function getEdit() {
    return getDefinition().edit;
  }

  it("starts collapsed, hiding the inner search block panel", () => {
    const Edit = getEdit();

    const { container } = render(
      <Edit attributes={{ label: "", navIconId: 0, navIconUrl: "" }} setAttributes={jest.fn()} />
    );

    const trigger = container.querySelector(".kt-search-panel-editor__trigger");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("inner-blocks").parentElement).toHaveAttribute("hidden");
  });

  it("expands to reveal the inner search block on trigger click", async () => {
    const user = userEvent.setup();
    const Edit = getEdit();

    const { container } = render(
      <Edit attributes={{ label: "", navIconId: 0, navIconUrl: "" }} setAttributes={jest.fn()} />
    );
    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("inner-blocks").parentElement).not.toHaveAttribute("hidden");
  });

  it("shows the fallback search icon when no nav icon is set", () => {
    const Edit = getEdit();

    const { container } = render(
      <Edit attributes={{ label: "", navIconId: 0, navIconUrl: "" }} setAttributes={jest.fn()} />
    );

    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    expect(trigger.querySelector("svg")).not.toBeNull();
    expect(trigger.querySelector("img")).toBeNull();
  });

  it("shows the selected nav icon image instead of the fallback icon", () => {
    const Edit = getEdit();

    const { container } = render(
      <Edit
        attributes={{ label: "", navIconId: 5, navIconUrl: "icon.svg" }}
        setAttributes={jest.fn()}
      />
    );

    const trigger = container.querySelector(".kt-search-panel-editor__trigger") as HTMLElement;
    expect(trigger.querySelector('img[src="icon.svg"]')).not.toBeNull();
    expect(trigger.querySelector("svg")).toBeNull();
  });

  it("shows the configured label, falling back to Search", () => {
    const Edit = getEdit();

    const { rerender } = render(
      <Edit attributes={{ label: "", navIconId: 0, navIconUrl: "" }} setAttributes={jest.fn()} />
    );
    expect(screen.getByText("Search")).toBeInTheDocument();

    rerender(
      <Edit
        attributes={{ label: "Find Anything", navIconId: 0, navIconUrl: "" }}
        setAttributes={jest.fn()}
      />
    );
    expect(screen.getByText("Find Anything")).toBeInTheDocument();
  });

  it("updates the label via the nav label text control", async () => {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(
      <Edit
        attributes={{ label: "", navIconId: 0, navIconUrl: "" }}
        setAttributes={setAttributes}
      />
    );
    await user.type(screen.getByLabelText("Nav label"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ label: "X" });
  });

  it("updates the nav icon attributes via the icon picker, open by default", async () => {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    render(
      <Edit
        attributes={{ label: "", navIconId: 0, navIconUrl: "" }}
        setAttributes={setAttributes}
      />
    );
    await user.click(screen.getByRole("button", { name: "pick-icon" }));

    expect(setAttributes).toHaveBeenCalledWith({ navIconId: 9, navIconUrl: "new-icon.svg" });
  });
});
