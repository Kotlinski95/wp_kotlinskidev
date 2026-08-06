import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface LinkControlProps {
  value: { url?: string; opensInNewTab?: boolean };
  onChange: (value: { url?: string; opensInNewTab?: boolean }) => void;
  onRemove: () => void;
}

let lastLinkControlProps: LinkControlProps | null = null;

interface RichTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

let lastRichTextProps: RichTextProps | null = null;

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RichText: (props: RichTextProps) => {
    lastRichTextProps = props;
    return <span data-testid="rich-text">{props.value}</span>;
  },
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

interface ButtonColorPanelProps {
  title: string;
  text: { onColorChange: (v: string) => void; onGradientChange: (v: string) => void };
  background: { onColorChange: (v: string) => void; onGradientChange: (v: string) => void };
  border: { onColorChange: (v: string) => void; onGradientChange: (v: string) => void };
}

const capturedPanels: Record<string, ButtonColorPanelProps> = {};

jest.mock("./ButtonColorControls", () => ({
  ButtonColorPanel: (props: ButtonColorPanelProps) => {
    capturedPanels[props.title] = props;
    return <div>{props.title}</div>;
  },
}));

import Edit from "./edit";

function baseAttributes() {
  return {
    text: "",
    url: "",
    opensInNewTab: false,
    rel: "",
    borderWidth: 2,
    textColor: "",
    textGradient: "",
    backgroundColor: "",
    backgroundGradient: "",
    borderColor: "",
    borderGradient: "",
    hoverTextColor: "",
    hoverTextGradient: "",
    hoverBackgroundColor: "",
    hoverBackgroundGradient: "",
    hoverBorderColor: "",
    hoverBorderGradient: "",
  };
}

describe("button Edit", () => {
  beforeEach(() => {
    lastLinkControlProps = null;
    lastRichTextProps = null;
  });

  it("has no href on the link when url is empty", () => {
    const { container } = render(<Edit attributes={baseAttributes()} setAttributes={jest.fn()} />);

    expect(container.querySelector(".kt-button__link")).not.toHaveAttribute("href");
  });

  it("sets the link href from the url attribute", () => {
    const { container } = render(
      <Edit
        attributes={{ ...baseAttributes(), url: "https://example.com" }}
        setAttributes={jest.fn()}
      />
    );

    expect(container.querySelector(".kt-button__link")).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("renders the button text via RichText and updates it on change", () => {
    const setAttributes = jest.fn();
    render(
      <Edit attributes={{ ...baseAttributes(), text: "Click me" }} setAttributes={setAttributes} />
    );

    expect(screen.getByTestId("rich-text")).toHaveTextContent("Click me");
    lastRichTextProps?.onChange("New text");

    expect(setAttributes).toHaveBeenCalledWith({ text: "New text" });
  });

  it("sets url and opensInNewTab together when the link control changes", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes()} setAttributes={setAttributes} />);

    await user.click(screen.getByRole("button", { name: "set-link" }));

    expect(setAttributes).toHaveBeenCalledWith({
      url: "https://example.com",
      opensInNewTab: true,
    });
  });

  it("clears the url when the link is removed", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes()} setAttributes={setAttributes} />);

    await user.click(screen.getByRole("button", { name: "remove-link" }));

    expect(setAttributes).toHaveBeenCalledWith({ url: "" });
  });

  it("passes the current url/opensInNewTab value into the link control", () => {
    render(
      <Edit
        attributes={{ ...baseAttributes(), url: "https://x.test", opensInNewTab: true }}
        setAttributes={jest.fn()}
      />
    );

    expect(lastLinkControlProps?.value).toEqual({ url: "https://x.test", opensInNewTab: true });
  });

  it("updates the rel attribute", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes()} setAttributes={setAttributes} />);

    await user.type(screen.getByLabelText("Rel attribute"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ rel: "X" });
  });

  it("updates the border width once its (collapsed) panel is opened", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes()} setAttributes={setAttributes} />);

    await user.click(screen.getByRole("button", { name: /Border width/ }));
    const slider = screen.getByRole("slider", { name: "Border width (px)" });

    expect(slider).toHaveValue("2");
  });

  it("prefers the gradient over the flat color for the CSS custom properties", () => {
    const { container } = render(
      <Edit
        attributes={{
          ...baseAttributes(),
          backgroundColor: "#111111",
          backgroundGradient: "linear-gradient(red, blue)",
        }}
        setAttributes={jest.fn()}
      />
    );

    const link = container.querySelector(".kt-button__link") as HTMLElement;
    expect(link.style.getPropertyValue("--kt-btn-bg")).toBe("linear-gradient(red, blue)");
  });

  it("falls back to the flat color when there is no gradient", () => {
    const { container } = render(
      <Edit
        attributes={{ ...baseAttributes(), backgroundColor: "#111111" }}
        setAttributes={jest.fn()}
      />
    );

    const link = container.querySelector(".kt-button__link") as HTMLElement;
    expect(link.style.getPropertyValue("--kt-btn-bg")).toBe("#111111");
  });

  it("sets the border width CSS variable in pixels", () => {
    const { container } = render(
      <Edit attributes={{ ...baseAttributes(), borderWidth: 5 }} setAttributes={jest.fn()} />
    );

    const link = container.querySelector(".kt-button__link") as HTMLElement;
    expect(link.style.getPropertyValue("--kt-btn-border-width")).toBe("5px");
  });

  it("renders separate color panels for the normal and hover states", () => {
    render(<Edit attributes={baseAttributes()} setAttributes={jest.fn()} />);

    expect(screen.getByText("Normal state")).toBeInTheDocument();
    expect(screen.getByText("Hover state")).toBeInTheDocument();
  });

  it("wires the normal-state text color panel to textColor", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={baseAttributes()} setAttributes={setAttributes} />);

    capturedPanels["Normal state"].text.onColorChange("#222222");

    expect(setAttributes).toHaveBeenCalledWith({ textColor: "#222222" });
  });

  it("wires the hover-state background color panel to hoverBackgroundColor", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={baseAttributes()} setAttributes={setAttributes} />);

    capturedPanels["Hover state"].background.onColorChange("#333333");

    expect(setAttributes).toHaveBeenCalledWith({ hoverBackgroundColor: "#333333" });
  });

  it("wires the hover-state border gradient panel to hoverBorderGradient", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={baseAttributes()} setAttributes={setAttributes} />);

    capturedPanels["Hover state"].border.onGradientChange("linear-gradient(green, yellow)");

    expect(setAttributes).toHaveBeenCalledWith({
      hoverBorderGradient: "linear-gradient(green, yellow)",
    });
  });
});
