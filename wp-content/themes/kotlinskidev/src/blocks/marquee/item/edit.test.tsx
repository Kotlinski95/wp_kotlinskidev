import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: ({
    render: renderProp,
  }: {
    render: (args: { open: () => void }) => React.ReactNode;
  }) => renderProp({ open: jest.fn() }),
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import Edit from "./edit";

describe("marquee/item Edit", () => {
  it("shows the label in the canvas preview", () => {
    render(
      <Edit
        attributes={{ label: "WordPress", navIconId: 0, navIconUrl: "", description: "" }}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByText("WordPress")).toBeInTheDocument();
  });

  it("updates the label field", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(
      <Edit
        attributes={{ label: "", navIconId: 0, navIconUrl: "", description: "" }}
        setAttributes={setAttributes}
      />
    );

    await user.type(screen.getByLabelText("Label"), "R");

    expect(setAttributes).toHaveBeenCalledWith({ label: "R" });
  });

  it("updates the modal description field", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(
      <Edit
        attributes={{ label: "React", navIconId: 0, navIconUrl: "", description: "" }}
        setAttributes={setAttributes}
      />
    );

    await user.type(screen.getByLabelText("Modal description"), "x");

    expect(setAttributes).toHaveBeenCalledWith({ description: "x" });
  });
});
