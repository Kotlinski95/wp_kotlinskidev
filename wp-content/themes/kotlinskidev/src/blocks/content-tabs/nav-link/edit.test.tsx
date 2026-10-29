import React from "react";
import { render, screen } from "@testing-library/react";
import { createReduxStore, register } from "@wordpress/data";

interface RichTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allowedFormats: string[];
  className?: string;
}

let lastRichTextProps: RichTextProps | null = null;

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  RichText: (props: RichTextProps) => {
    lastRichTextProps = props;
    return <span data-testid="rich-text">{props.value}</span>;
  },
}));

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    actions: {},
    selectors: {
      getBlockRootClientId: () => null,
    },
  })
);

import Edit from "./edit";

describe("content-tabs-nav-link Edit", () => {
  beforeEach(() => {
    lastRichTextProps = null;
  });

  it("renders the label via RichText and updates it on change", () => {
    const setAttributes = jest.fn();

    render(
      <Edit
        clientId="nav-link-1"
        attributes={{ label: "Creating Websites" }}
        setAttributes={setAttributes}
      />
    );

    expect(screen.getByTestId("rich-text")).toHaveTextContent("Creating Websites");

    lastRichTextProps?.onChange("New label");
    expect(setAttributes).toHaveBeenCalledWith({ label: "New label" });
  });

  it("excludes the link format, since this content renders inside a real <button>", () => {
    render(<Edit clientId="nav-link-1" attributes={{ label: "" }} setAttributes={jest.fn()} />);

    expect(lastRichTextProps?.allowedFormats).toEqual(["core/bold", "core/italic"]);
    expect(lastRichTextProps?.allowedFormats).not.toContain("core/link");
  });

  it("renders in place (no portal, no active class) when there is no surrounding ContentTabsPortalContext", () => {
    render(
      <Edit
        clientId="nav-link-1"
        attributes={{ label: "Creating Websites" }}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByTestId("rich-text")).toBeInTheDocument();
    expect(lastRichTextProps?.className).toBe("kt-content-tabs-nav-link-editor");
  });
});
