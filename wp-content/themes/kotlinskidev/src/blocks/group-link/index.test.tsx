import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

interface LinkControlProps {
  value: { url?: string; opensInNewTab?: boolean };
  onChange: (value: { url?: string; opensInNewTab?: boolean }) => void;
  onRemove: () => void;
}

let lastLinkControlProps: LinkControlProps | null = null;

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  __experimentalLinkControl: (props: LinkControlProps) => {
    lastLinkControlProps = props;
    return (
      <div>
        <button onClick={() => props.onChange({ url: "https://example.com", opensInNewTab: true })}>
          set-link
        </button>
        <button onClick={() => props.onRemove()}>remove-link</button>
      </div>
    );
  },
}));

import "./index";

describe("group-link — blocks.registerBlockType filter", () => {
  it("leaves an unrelated block unchanged", () => {
    const settings = { name: "core/paragraph", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds groupLinkUrl and groupLinkOpensInNewTab attributes to core/group", () => {
    const settings = { name: "core/group", attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: {
        groupLinkUrl: { type: string; default: string };
        groupLinkOpensInNewTab: { type: string; default: boolean };
      };
    };

    expect(result.attributes.groupLinkUrl).toEqual({ type: "string", default: "" });
    expect(result.attributes.groupLinkOpensInNewTab).toEqual({ type: "boolean", default: false });
  });
});

describe("group-link — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name?: string;
    attributes: { groupLinkUrl?: string; groupLinkOpensInNewTab?: boolean };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  beforeEach(() => {
    lastLinkControlProps = null;
  });

  it("renders only the original edit for an unrelated block", () => {
    renderWrapped({ name: "core/paragraph", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("set-link")).not.toBeInTheDocument();
  });

  it("renders the link control for core/group with the current value", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/group",
      attributes: { groupLinkUrl: "/contact/", groupLinkOpensInNewTab: true },
      setAttributes: jest.fn(),
    });

    await user.click(screen.getByRole("button", { name: /Link whole group/ }));

    expect(lastLinkControlProps?.value).toEqual({ url: "/contact/", opensInNewTab: true });
  });

  it("setting a link updates groupLinkUrl and groupLinkOpensInNewTab", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({ name: "core/group", attributes: {}, setAttributes });

    await user.click(screen.getByRole("button", { name: /Link whole group/ }));
    await user.click(screen.getByText("set-link"));

    expect(setAttributes).toHaveBeenCalledWith({
      groupLinkUrl: "https://example.com",
      groupLinkOpensInNewTab: true,
    });
  });

  it("removing a link clears groupLinkUrl", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/group",
      attributes: { groupLinkUrl: "/contact/" },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: /Link whole group/ }));
    await user.click(screen.getByText("remove-link"));

    expect(setAttributes).toHaveBeenCalledWith({ groupLinkUrl: "" });
  });
});
