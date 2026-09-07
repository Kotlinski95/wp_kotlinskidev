import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: ({ template }: { template: [string, object][] }) => (
    <div data-testid="inner-blocks" data-template-length={template.length} />
  ),
  useSettings: () => [[], []],
}));

interface MockColorGradientControlProps {
  label: string;
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (v?: string) => void;
  onGradientChange: (v?: string) => void;
}

let lastColorGradientProps: MockColorGradientControlProps | null = null;

jest.mock("../../shared/color-gradient-control", () => ({
  ColorGradientControl: (props: MockColorGradientControlProps) => {
    lastColorGradientProps = props;
    return <div data-testid="color-gradient-control">{props.label}</div>;
  },
}));

import Edit from "./edit";

describe("pricing-cards/item Edit", () => {
  it("renders the card body with a 6-block default template, unfeatured by default", () => {
    const setAttributes = jest.fn();
    const { container, getByTestId } = render(
      <Edit
        attributes={{ featured: false, badgeFontSize: "", badgeTextColor: "", badgeGradient: "" }}
        setAttributes={setAttributes}
      />
    );

    expect(container.querySelector(".pricing-card")).not.toBeNull();
    expect(container.querySelector(".pricing-card--featured")).toBeNull();
    expect(container.querySelector(".pricing-card__badge")).toBeNull();
    expect(container.querySelector(".pricing-card__body")).not.toBeNull();
    expect(getByTestId("inner-blocks").dataset.templateLength).toBe("6");
  });

  it("shows the badge and featured class when featured is true", () => {
    const setAttributes = jest.fn();
    const { container } = render(
      <Edit
        attributes={{ featured: true, badgeFontSize: "", badgeTextColor: "", badgeGradient: "" }}
        setAttributes={setAttributes}
      />
    );

    expect(container.querySelector(".pricing-card--featured")).not.toBeNull();
    expect(container.querySelector(".pricing-card__badge")).toHaveTextContent("Most popular");
  });

  it("toggles the featured attribute from the Inspector control", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    render(
      <Edit
        attributes={{ featured: false, badgeFontSize: "", badgeTextColor: "", badgeGradient: "" }}
        setAttributes={setAttributes}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: "Highlight as most popular" }));

    expect(setAttributes).toHaveBeenCalledWith({ featured: true });
  });

  it("does not show badge styling controls when not featured", () => {
    const setAttributes = jest.fn();
    render(
      <Edit
        attributes={{ featured: false, badgeFontSize: "", badgeTextColor: "", badgeGradient: "" }}
        setAttributes={setAttributes}
      />
    );

    expect(screen.queryByText("Badge font size")).not.toBeInTheDocument();
    expect(screen.queryByText("Badge text color")).not.toBeInTheDocument();
  });

  it("shows badge styling controls when featured, and applies badgeFontSize/badgeTextColor as inline styles on the badge", () => {
    const setAttributes = jest.fn();
    const { container } = render(
      <Edit
        attributes={{
          featured: true,
          badgeFontSize: "1.25rem",
          badgeTextColor: "#ff0000",
          badgeGradient: "",
        }}
        setAttributes={setAttributes}
      />
    );

    expect(screen.getByText("Badge font size")).toBeInTheDocument();
    expect(screen.getByText("Badge text color")).toBeInTheDocument();

    const badge = container.querySelector(".pricing-card__badge") as HTMLElement;
    expect(badge.style.fontSize).toBe("1.25rem");
    expect(badge.style.color).toBe("rgb(255, 0, 0)");
  });

  it("leaves the badge with no inline style when badgeFontSize/badgeTextColor are empty, falling back to the stylesheet default", () => {
    const setAttributes = jest.fn();
    const { container } = render(
      <Edit
        attributes={{ featured: true, badgeFontSize: "", badgeTextColor: "", badgeGradient: "" }}
        setAttributes={setAttributes}
      />
    );

    const badge = container.querySelector(".pricing-card__badge") as HTMLElement;
    expect(badge.style.fontSize).toBe("");
    expect(badge.style.color).toBe("");
  });

  it("renders the badge's gradient text with background-clip:text instead of a plain color, when badgeGradient is set", () => {
    const setAttributes = jest.fn();
    const { container } = render(
      <Edit
        attributes={{
          featured: true,
          badgeFontSize: "",
          badgeTextColor: "",
          badgeGradient: "linear-gradient(135deg, #ff0000 0%, #0000ff 100%)",
        }}
        setAttributes={setAttributes}
      />
    );

    // jsdom's CSSOM doesn't parse linear-gradient() as a valid background-image value at all
    // (confirmed directly: even the simplest two-color gradient is silently rejected), so
    // backgroundImage can't be asserted here — checking the other gradient-text properties
    // (which jsdom does apply correctly) is enough to prove the gradient branch, not the plain
    // color branch, is what set the badge's style.
    const badge = container.querySelector(".pricing-card__badge") as HTMLElement;
    expect(badge.style.backgroundClip).toBe("text");
    expect(badge.style.WebkitTextFillColor).toBe("transparent");
    expect(badge.style.color).toBe("transparent");
  });

  it("clears badgeTextColor when a gradient is picked, and clears badgeGradient when a solid color is picked back", () => {
    const setAttributes = jest.fn();
    render(
      <Edit
        attributes={{ featured: true, badgeFontSize: "", badgeTextColor: "", badgeGradient: "" }}
        setAttributes={setAttributes}
      />
    );

    lastColorGradientProps?.onGradientChange("linear-gradient(90deg, #fff 0%, #000 100%)");
    expect(setAttributes).toHaveBeenLastCalledWith({
      badgeTextColor: "",
      badgeGradient: "linear-gradient(90deg, #fff 0%, #000 100%)",
    });

    lastColorGradientProps?.onColorChange("#00ff00");
    expect(setAttributes).toHaveBeenLastCalledWith({
      badgeTextColor: "#00ff00",
      badgeGradient: "",
    });
  });
});
