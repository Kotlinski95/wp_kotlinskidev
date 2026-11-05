import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

interface RichTextProps {
  value: string;
  onChange: (value: string) => void;
  className: string;
  tagName: string;
}

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RichText: (props: RichTextProps) => (
    <div data-testid="rich-text" className={props.className} data-tag={props.tagName}>
      {props.value}
    </div>
  ),
}));

import "./index";

function getDefinition() {
  return (registerBlockType as jest.Mock).mock.calls[0][1];
}

function baseAttributes() {
  return {
    content: "",
    useProtection: false,
    protectionType: "email" as const,
    tagName: "p",
    isHtmlMode: false,
  };
}

describe("protected-content registration", () => {
  it("registers with the expected name and attribute defaults", () => {
    const definition = getDefinition();

    expect(registerBlockType).toHaveBeenCalledWith(
      "kotlinskidev/protected-content",
      expect.objectContaining({
        attributes: expect.objectContaining({
          content: { type: "string", default: "" },
          useProtection: { type: "boolean", default: false },
          protectionType: { type: "string", default: "email" },
          tagName: { type: "string", default: "p" },
          isHtmlMode: { type: "boolean", default: false },
        }),
      })
    );
    expect(definition.save()).toBeNull();
  });
});

describe("protected-content Edit", () => {
  function getEdit() {
    return getDefinition().edit;
  }

  function renderEdit(overrides: Partial<ReturnType<typeof baseAttributes>> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("toggles protection on", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Use Protection" }));

    expect(setAttributes).toHaveBeenCalledWith({ useProtection: true });
  });

  it("hides the protection type select and indicator while protection is off", () => {
    renderEdit({ useProtection: false });

    expect(screen.queryByRole("combobox", { name: "Protection Type" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Protected Content/)).not.toBeInTheDocument();
  });

  it("shows the protection type select and indicator once protection is on", () => {
    renderEdit({ useProtection: true, protectionType: "phone" });

    expect(screen.getByRole("combobox", { name: "Protection Type" })).toBeInTheDocument();
    expect(screen.getByText(/\(phone\)/)).toBeInTheDocument();
  });

  it("updates the protection type", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ useProtection: true });

    await user.selectOptions(screen.getByRole("combobox", { name: "Protection Type" }), "Address");

    expect(setAttributes).toHaveBeenCalledWith({ protectionType: "address" });
  });

  it("toggles HTML mode", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "HTML Mode" }));

    expect(setAttributes).toHaveBeenCalledWith({ isHtmlMode: true });
  });

  it("updates the HTML tag", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.selectOptions(screen.getByRole("combobox", { name: "HTML Tag" }), "Heading 2");

    expect(setAttributes).toHaveBeenCalledWith({ tagName: "h2" });
  });

  it("renders RichText with the unprotected class when not in HTML mode and protection is off", () => {
    renderEdit({ isHtmlMode: false, useProtection: false });

    expect(screen.getByTestId("rich-text")).toHaveClass("protected-content");
    expect(screen.queryByLabelText("HTML Content")).not.toBeInTheDocument();
  });

  it("renders RichText with the protection-type class when protection is on", () => {
    renderEdit({ isHtmlMode: false, useProtection: true, protectionType: "other" });

    expect(screen.getByTestId("rich-text")).toHaveClass(
      "protected-content",
      "protected-content--other"
    );
  });

  it("switches to a textarea in HTML mode and updates content", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ isHtmlMode: true });

    expect(screen.queryByTestId("rich-text")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("HTML Content"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ content: "X" });
  });

  it("hides the HTML preview when the content is empty", () => {
    renderEdit({ isHtmlMode: true, content: "" });

    expect(screen.queryByText("Preview:")).not.toBeInTheDocument();
  });

  it("renders an HTML preview once content is set", () => {
    const { container } = renderEdit({ isHtmlMode: true, content: "<strong>Hi</strong>" });

    expect(screen.getByText("Preview:")).toBeInTheDocument();
    expect(container.querySelector(".html-preview > div")).toHaveTextContent("Hi");
  });
});
