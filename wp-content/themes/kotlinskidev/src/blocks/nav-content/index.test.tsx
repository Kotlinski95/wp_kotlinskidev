import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string; alt?: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

let lastMediaUploadProps: MediaUploadProps | null = null;

interface RichTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  style?: React.CSSProperties;
}

let lastRichTextProps: RichTextProps | null = null;

interface LinkControlLink {
  url?: string;
  title?: string;
  opensInNewTab?: boolean;
}

interface LinkControlProps {
  value: LinkControlLink;
  onChange: (value: LinkControlLink) => void;
  onRemove?: () => void;
}

let lastLinkControlProps: LinkControlProps | null = null;

interface ColorGradientControlProps {
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (value?: string) => void;
  onGradientChange: (value?: string) => void;
}

let lastColorGradientControlProps: ColorGradientControlProps | null = null;

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown> = {}) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    lastMediaUploadProps = props;
    return <>{props.render({ open: jest.fn() })}</>;
  },
  RichText: (props: RichTextProps) => {
    lastRichTextProps = props;
    return (
      <input
        placeholder={props.placeholder}
        value={props.value}
        style={props.style}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  },
  __experimentalLinkControl: (props: LinkControlProps) => {
    lastLinkControlProps = props;
    return (
      <div>
        <button onClick={() => props.onChange({ url: "https://example.com", opensInNewTab: true })}>
          set-link
        </button>
        <button
          onClick={() =>
            props.onChange({ url: "https://x.test", opensInNewTab: false, title: "X Title" })
          }
        >
          set-link-with-title
        </button>
        <button onClick={() => props.onRemove?.()}>remove-link</button>
      </div>
    );
  },
  __experimentalColorGradientControl: (props: ColorGradientControlProps) => {
    lastColorGradientControlProps = props;
    return (
      <div>
        <button onClick={() => props.onColorChange("#111111")}>pick-color</button>
        <button onClick={() => props.onColorChange(undefined)}>clear-color</button>
        <button onClick={() => props.onGradientChange("linear-gradient(a,b)")}>
          pick-gradient
        </button>
        <button onClick={() => props.onGradientChange(undefined)}>clear-gradient</button>
      </div>
    );
  },
}));

import "./index";

function getDefinition(name: string) {
  const call = (registerBlockType as jest.Mock).mock.calls.find(
    (c) => (c[0] as { name: string }).name === name
  );
  return call?.[1];
}

function panelFor(title: string) {
  return screen
    .getByRole("button", { name: title })
    .closest(".components-panel__body") as HTMLElement;
}

beforeEach(() => {
  lastMediaUploadProps = null;
  lastRichTextProps = null;
  lastLinkControlProps = null;
  lastColorGradientControlProps = null;
});

describe("nav-content registration", () => {
  it("registers all four nav-content blocks with a null save", () => {
    [
      "kotlinskidev/nav-paragraph",
      "kotlinskidev/nav-image",
      "kotlinskidev/nav-banner",
      "kotlinskidev/nav-link",
    ].forEach((name) => {
      const definition = getDefinition(name);
      expect(definition).toBeDefined();
      expect(definition.save()).toBeNull();
    });
  });
});

describe("NavParagraphEdit", () => {
  function getEdit() {
    return getDefinition("kotlinskidev/nav-paragraph").edit;
  }

  function renderEdit(overrides: Record<string, unknown> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit
        attributes={{ content: "", textColor: "", textGradient: "", ...overrides }}
        setAttributes={setAttributes}
      />
    );
    return { ...utils, setAttributes };
  }

  it("shows a placeholder when there is no content", () => {
    renderEdit();

    expect(screen.getByText(/Nav paragraph — add text/)).toBeInTheDocument();
  });

  it("previews the configured content instead of the placeholder", () => {
    const { container } = renderEdit({ content: "Hello there" });

    expect(container.querySelector("p")).toHaveTextContent("Hello there");
    expect(screen.queryByText(/Nav paragraph — add text/)).not.toBeInTheDocument();
  });

  it("updates the paragraph text", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Paragraph text"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ content: "X" });
  });

  it("applies the flat text color to the preview", () => {
    const { container } = renderEdit({ content: "Hi", textColor: "#ff0000" });

    expect((container.querySelector("p") as HTMLElement).style.color).toBe("rgb(255, 0, 0)");
  });

  it("prefers the gradient over the flat color for the preview", () => {
    const { container } = renderEdit({
      content: "Hi",
      textColor: "#ff0000",
      textGradient: "linear-gradient(red, blue)",
    });

    expect((container.querySelector("p") as HTMLElement).style.color).toBe("transparent");
  });

  it("wires the text color panel", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("button", { name: "Text color" }));
    expect(lastColorGradientControlProps?.colorValue).toBeUndefined();
    await user.click(screen.getByRole("button", { name: "pick-color" }));

    expect(setAttributes).toHaveBeenCalledWith({ textColor: "#111111" });
  });

  it("clears the gradient to an empty string", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("button", { name: "Text color" }));
    await user.click(screen.getByRole("button", { name: "clear-gradient" }));

    expect(setAttributes).toHaveBeenCalledWith({ textGradient: "" });
  });
});

describe("NavImageEdit", () => {
  function getEdit() {
    return getDefinition("kotlinskidev/nav-image").edit;
  }

  function renderEdit(overrides: Record<string, unknown> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit
        attributes={{ mediaId: 0, mediaUrl: "", altText: "", linkUrl: "", ...overrides }}
        setAttributes={setAttributes}
      />
    );
    return { ...utils, setAttributes };
  }

  it("shows a placeholder and Select image when there is no media", () => {
    renderEdit();

    expect(screen.getByText(/Nav image — select an image/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select image" })).toBeInTheDocument();
  });

  it("renders the image and Replace image once media is set", () => {
    const { container } = renderEdit({ mediaUrl: "img.jpg", altText: "Alt" });

    expect(container.querySelector("img")).toHaveAttribute("src", "img.jpg");
    expect(container.querySelector("img")).toHaveAttribute("alt", "Alt");
    expect(screen.getByRole("button", { name: "Replace image" })).toBeInTheDocument();
  });

  it("sets mediaId/Url/altText when an image is selected", () => {
    const { setAttributes } = renderEdit();

    lastMediaUploadProps?.onSelect({ id: 5, url: "chosen.jpg", alt: "Chosen" });

    expect(setAttributes).toHaveBeenCalledWith({
      mediaId: 5,
      mediaUrl: "chosen.jpg",
      altText: "Chosen",
    });
  });

  it("updates the alt text and link URL", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Alt text"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ altText: "X" });

    await user.type(screen.getByLabelText("Link URL"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ linkUrl: "X" });
  });
});

describe("NavBannerEdit", () => {
  function getEdit() {
    return getDefinition("kotlinskidev/nav-banner").edit;
  }

  function baseAttributes() {
    return {
      mediaId: 0,
      mediaUrl: "",
      altText: "",
      heading: "",
      description: "",
      linkUrl: "",
      linkLabel: "",
    };
  }

  function renderEdit(overrides: Record<string, unknown> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("shows placeholders for image, heading and description when empty", () => {
    renderEdit();

    expect(screen.getByText(/Nav banner — select an image/)).toBeInTheDocument();
    expect(screen.getByText("Heading…")).toBeInTheDocument();
    expect(screen.getByText("Description…")).toBeInTheDocument();
  });

  it("previews the configured heading, description, and image", () => {
    const { container } = renderEdit({
      mediaUrl: "banner.jpg",
      heading: "My Heading",
      description: "My description",
    });

    expect(container.querySelector("img")).toHaveAttribute("src", "banner.jpg");
    const preview = container.querySelector('div[style*="flex-direction: column"]') as HTMLElement;
    expect(within(preview).getByText("My Heading")).toBeInTheDocument();
    expect(within(preview).getByText("My description")).toBeInTheDocument();
  });

  it("sets media attributes when an image is selected", () => {
    const { setAttributes } = renderEdit();

    lastMediaUploadProps?.onSelect({ id: 9, url: "chosen.jpg", alt: "Chosen" });

    expect(setAttributes).toHaveBeenCalledWith({
      mediaId: 9,
      mediaUrl: "chosen.jpg",
      altText: "Chosen",
    });
  });

  it("updates heading, description, link URL, and link label", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(within(panelFor("Content")).getByLabelText("Heading"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ heading: "X" });

    await user.type(within(panelFor("Content")).getByLabelText("Description"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ description: "X" });

    await user.type(within(panelFor("Link")).getByLabelText("URL"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ linkUrl: "X" });

    await user.type(within(panelFor("Link")).getByLabelText("Label"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ linkLabel: "X" });
  });

  it("shows the link label preview only when both a URL and a label are set", () => {
    const { rerender } = render(
      React.createElement(getEdit(), {
        attributes: { ...baseAttributes(), linkUrl: "https://x.test" },
        setAttributes: jest.fn(),
      })
    );
    expect(screen.queryByText("Learn more →")).not.toBeInTheDocument();

    const Edit = getEdit();
    rerender(
      <Edit
        attributes={{ ...baseAttributes(), linkUrl: "https://x.test", linkLabel: "Learn more" }}
        setAttributes={jest.fn()}
      />
    );
    expect(screen.getByText("Learn more →")).toBeInTheDocument();
  });
});

describe("NavLinkEdit", () => {
  function getEdit() {
    return getDefinition("kotlinskidev/nav-link").edit;
  }

  function baseAttributes() {
    return {
      label: "",
      url: "",
      opensInNewTab: false,
      description: "",
      rel: "",
      textColor: "",
      textGradient: "",
    };
  }

  function renderEdit(overrides: Record<string, unknown> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("passes the current url/opensInNewTab into the link control", () => {
    renderEdit({ url: "https://x.test", opensInNewTab: true });

    expect(lastLinkControlProps?.value).toEqual({ url: "https://x.test", opensInNewTab: true });
  });

  it("sets url and opensInNewTab when the link control changes", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("button", { name: "set-link" }));

    expect(setAttributes).toHaveBeenCalledWith({
      url: "https://example.com",
      opensInNewTab: true,
    });
  });

  it("auto-fills the label from the link title only when the label is currently empty", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ label: "" });

    await user.click(screen.getByRole("button", { name: "set-link-with-title" }));

    expect(setAttributes).toHaveBeenCalledWith({
      url: "https://x.test",
      opensInNewTab: false,
      label: "X Title",
    });
  });

  it("does not overwrite an existing label when the link title changes", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit({ label: "Existing" });

    await user.click(screen.getByRole("button", { name: "set-link-with-title" }));

    expect(setAttributes).toHaveBeenCalledWith({
      url: "https://x.test",
      opensInNewTab: false,
    });
  });

  it("clears the url when the link is removed", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("button", { name: "remove-link" }));

    expect(setAttributes).toHaveBeenCalledWith({ url: "" });
  });

  it("updates the description and rel attribute", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Description"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ description: "X" });

    await user.type(screen.getByLabelText("Rel attribute"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ rel: "X" });
  });

  it("renders the label via RichText and updates it on change", () => {
    const { setAttributes } = renderEdit({ label: "Click me" });

    expect(lastRichTextProps?.value).toBe("Click me");
    lastRichTextProps?.onChange("New label");

    expect(setAttributes).toHaveBeenCalledWith({ label: "New label" });
  });

  it("applies the gradient to the label style, taking priority over the flat color", () => {
    renderEdit({
      textColor: "#ff0000",
      textGradient: "linear-gradient(red, blue)",
    });

    expect((screen.getByPlaceholderText("Nav link label…") as HTMLElement).style.color).toBe(
      "transparent"
    );
  });

  it("wires the text color panel", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("button", { name: "Text color" }));
    await user.click(screen.getByRole("button", { name: "pick-gradient" }));

    expect(setAttributes).toHaveBeenCalledWith({ textGradient: "linear-gradient(a,b)" });
  });
});
