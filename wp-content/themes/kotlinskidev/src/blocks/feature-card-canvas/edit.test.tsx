import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockDestroy = jest.fn();
const mockMount = jest.fn(() => ({
  setVisible: jest.fn(),
  setTarget: jest.fn(),
  destroy: mockDestroy,
}));

jest.mock("./runtime", () => ({
  mountFeatureCanvas: (...args: unknown[]) => mockMount(...(args as [])),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSettings: () => [
    [
      { name: "Primary", slug: "primary", color: "#111111" },
      { name: "Teal", slug: "teal", color: "#00aaaa" },
    ],
  ],
}));

import Edit, { type FeatureCardCanvasAttributes } from "./edit";

const attributes: FeatureCardCanvasAttributes = {
  variant: "node-tree",
  aspectRatio: "16/9",
  labelOne: "A",
  labelTwo: "B",
  labelThree: "C",
  description: "",
  accentColor: "",
  touchAutoplay: true,
  trigger: "hover",
};

describe("feature-card-canvas Edit", () => {
  beforeEach(() => {
    mockMount.mockClear();
    mockDestroy.mockClear();
  });

  it("renders the preview host with variant, labels and aspect ratio", () => {
    const { container } = render(<Edit attributes={attributes} setAttributes={jest.fn()} />);
    const host = container.querySelector<HTMLElement>(".kt-feature-canvas")!;
    expect(host.dataset.variant).toBe("node-tree");
    expect(host.dataset.labels).toBe('["A","B","C"]');
    expect(host.style.aspectRatio).toBe("16/9");
    expect(host.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("mounts on render and destroys on unmount", () => {
    const { unmount } = render(<Edit attributes={attributes} setAttributes={jest.fn()} />);
    expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLElement), {
      variant: "node-tree",
      labels: ["A", "B", "C"],
      accent: "primary",
    });
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("updates the variant", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={attributes} setAttributes={setAttributes} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Variant" }), "chart-growth");
    expect(setAttributes).toHaveBeenCalledWith({ variant: "chart-growth" });
  });

  it("updates labels and aspect ratio", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(
      <Edit
        attributes={{ ...attributes, labelOne: "", aspectRatio: "" }}
        setAttributes={setAttributes}
      />
    );
    await user.type(screen.getByLabelText("Label one"), "X");
    await user.type(screen.getByLabelText("Aspect ratio"), "1");
    expect(setAttributes).toHaveBeenCalledWith({ labelOne: "X" });
    expect(setAttributes).toHaveBeenCalledWith({ aspectRatio: "1" });
  });

  it("reflects the accent slug on the preview host", () => {
    const { container } = render(
      <Edit attributes={{ ...attributes, accentColor: "teal" }} setAttributes={jest.fn()} />
    );
    expect(container.querySelector<HTMLElement>(".kt-feature-canvas")!.dataset.accent).toBe("teal");
  });

  it("stores the slug, never the hex, when a swatch is picked", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={attributes} setAttributes={setAttributes} />);
    await user.click(screen.getByRole("button", { name: "Colour" }));
    await user.click(screen.getByRole("option", { name: /Teal/ }));
    expect(setAttributes).toHaveBeenCalledWith({ accentColor: "teal" });
  });

  it("toggles touch autoplay", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={attributes} setAttributes={setAttributes} />);
    await user.click(screen.getByRole("button", { name: "Animation" }));
    await user.click(screen.getByLabelText("Animate automatically on touch devices"));
    expect(setAttributes).toHaveBeenCalledWith({ touchAutoplay: false });
  });
});
