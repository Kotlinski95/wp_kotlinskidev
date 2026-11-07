import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { withClassState } from "./index";

describe("withClassState", () => {
  it("adds a token to an empty class list", () => {
    expect(withClassState(undefined, "kt-overlay-link", true)).toBe("kt-overlay-link");
  });

  it("keeps existing classes and does not duplicate the token", () => {
    expect(withClassState("is-style-outline kt-overlay-link", "kt-overlay-link", true)).toBe(
      "is-style-outline kt-overlay-link"
    );
  });

  it("removes only the token and returns undefined when nothing is left", () => {
    expect(withClassState("a kt-overlay-link", "kt-overlay-link", false)).toBe("a");
    expect(withClassState("kt-overlay-link", "kt-overlay-link", false)).toBeUndefined();
  });
});

describe("overlay-link-controls — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    attributes: { className?: string };
    setAttributes: (attrs: { className?: string }) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  it("shows no panel for a non-button block", () => {
    renderWrapped({ name: "core/group", attributes: {}, setAttributes: jest.fn() });

    expect(screen.queryByText("Overlay link")).not.toBeInTheDocument();
  });

  it("adds the overlay class when Stretch over container is switched on", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/button",
      attributes: { className: "is-style-outline" },
      setAttributes,
    });

    await user.click(screen.getByRole("button", { name: /Overlay link/ }));
    await user.click(screen.getByRole("checkbox", { name: /Stretch over container/ }));

    expect(setAttributes).toHaveBeenCalledWith({ className: "is-style-outline kt-overlay-link" });
  });

  it("disables Hide label until the overlay is on", async () => {
    const user = userEvent.setup();
    renderWrapped({ name: "core/button", attributes: {}, setAttributes: jest.fn() });

    await user.click(screen.getByRole("button", { name: /Overlay link/ }));

    expect(screen.getByRole("checkbox", { name: /Hide label/ })).toBeDisabled();
  });

  it("removes both classes when the overlay is switched off", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    renderWrapped({
      name: "core/button",
      attributes: { className: "kt-overlay-link kt-overlay-link--label-hidden" },
      setAttributes,
    });

    await user.click(screen.getByRole("checkbox", { name: /Stretch over container/ }));

    expect(setAttributes).toHaveBeenCalledWith({ className: undefined });
  });
});
