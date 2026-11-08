import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@wordpress/blocks", () => ({
  hasBlockSupport: jest.fn(),
}));

import { hasBlockSupport } from "@wordpress/blocks";
import "./index";

const mockedHasBlockSupport = hasBlockSupport as jest.Mock;

interface Props {
  name: string;
  attributes: { className?: string };
  setAttributes: (attrs: { className?: string }) => void;
}

function OriginalEdit() {
  return <div data-testid="original-edit" />;
}

function renderWrapped(props: Props) {
  const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
  return render(<Wrapped {...props} />);
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Utility Classes/ }));
}

describe("withUtilityClassPicker", () => {
  beforeEach(() => {
    mockedHasBlockSupport.mockReset();
  });

  it("renders only the original edit component when customClassName support is disabled", () => {
    mockedHasBlockSupport.mockReturnValue(false);

    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Utility Classes")).not.toBeInTheDocument();
  });

  it("renders the utility class panel when customClassName support is enabled", () => {
    mockedHasBlockSupport.mockReturnValue(true);

    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.getByText("Utility Classes")).toBeInTheDocument();
  });

  it("checks the boxes matching classes already present on the block", async () => {
    mockedHasBlockSupport.mockReturnValue(true);
    const user = userEvent.setup();

    renderWrapped({
      name: "core/group",
      attributes: { className: "full-width no-wrap" },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("checkbox", { name: /Full Width/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /No Wrap/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Full Height/ })).not.toBeChecked();
  });

  it("adds a class to className when its checkbox is checked", async () => {
    mockedHasBlockSupport.mockReturnValue(true);
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    renderWrapped({ name: "core/group", attributes: {}, setAttributes });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: /Full Width/ }));

    expect(setAttributes).toHaveBeenCalledWith({ className: "full-width" });
  });

  it("removes a class from className when its checkbox is unchecked", async () => {
    mockedHasBlockSupport.mockReturnValue(true);
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    renderWrapped({
      name: "core/group",
      attributes: { className: "full-width no-wrap" },
      setAttributes,
    });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: /Full Width/ }));

    expect(setAttributes).toHaveBeenCalledWith({ className: "no-wrap" });
  });

  it("sets className to undefined when the last utility class is removed", async () => {
    mockedHasBlockSupport.mockReturnValue(true);
    const setAttributes = jest.fn();
    const user = userEvent.setup();

    renderWrapped({
      name: "core/group",
      attributes: { className: "full-width" },
      setAttributes,
    });
    await openPanel(user);

    await user.click(screen.getByRole("checkbox", { name: /Full Width/ }));

    expect(setAttributes).toHaveBeenCalledWith({ className: undefined });
  });
});
