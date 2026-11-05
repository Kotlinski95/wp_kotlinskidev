import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { applyFilters } from "@wordpress/hooks";
import { createReduxStore, register } from "@wordpress/data";
import type { ComponentType } from "react";

jest.mock("@wordpress/block-editor", () => ({
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockNavigationParents: Record<string, string[]> = {
  "in-nav": ["navigation-client-id"],
  "outside-nav": [],
};

register(
  createReduxStore("core/block-editor", {
    reducer: (state = {}) => state,
    selectors: {
      getBlockParentsByBlockName: (_state: unknown, clientId: string) =>
        mockNavigationParents[clientId] ?? [],
    },
  })
);

import "./index";

describe("nav-reveal-animation — blocks.registerBlockType filter", () => {
  it("leaves excluded blocks untouched", () => {
    const settings = { name: "core/preformatted", attributes: {} };

    expect(applyFilters("blocks.registerBlockType", settings)).toBe(settings);
  });

  it("adds the three nav-reveal attributes for a supported block", () => {
    const settings = { name: "core/navigation-link", attributes: { existing: {} } };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, { type: string; default: unknown }>;
    };

    expect(result.attributes.existing).toBeDefined();
    expect(result.attributes.navRevealAnimation).toEqual({ type: "string", default: "" });
    expect(result.attributes.navRevealDelay).toEqual({ type: "number", default: 0 });
    expect(result.attributes.navRevealTranslate).toEqual({ type: "string", default: "" });
  });

  it("does nothing when the block settings have no attributes object", () => {
    const settings = { name: "core/navigation-link" };

    const result = applyFilters("blocks.registerBlockType", settings) as { attributes?: unknown };

    expect(result.attributes).toBeUndefined();
  });

  it.each(["core/group", "core/paragraph", "core/cover", "kotlinskidev/simple-grid"])(
    "leaves %s untouched — only nav-scoped blocks get the reveal attributes",
    (name) => {
      const settings = { name, attributes: {} };

      const result = applyFilters("blocks.registerBlockType", settings) as {
        attributes: Record<string, unknown>;
      };

      expect(result.attributes.navRevealAnimation).toBeUndefined();
    }
  );

  it.each([
    "core/navigation-link",
    "core/navigation-submenu",
    "kotlinskidev/nav-link",
    "kotlinskidev/nav-banner",
    "kotlinskidev/nav-image",
    "kotlinskidev/nav-paragraph",
    "kotlinskidev/nav-search-panel",
    "kotlinskidev/nav-language-panel",
    "kotlinskidev/nav-popular-pages",
    "kotlinskidev/button",
    "kotlinskidev/social-section",
    "kotlinskidev/search-panel",
    "kotlinskidev/language-panel",
  ])("adds the reveal attributes to the nav-scoped block %s", (name) => {
    const settings = { name, attributes: {} };

    const result = applyFilters("blocks.registerBlockType", settings) as {
      attributes: Record<string, unknown>;
    };

    expect(result.attributes.navRevealAnimation).toBeDefined();
  });
});

describe("nav-reveal-animation — editor.BlockEdit filter", () => {
  function OriginalEdit() {
    return <div data-testid="original-edit" />;
  }

  interface Props {
    name: string;
    clientId: string;
    attributes: {
      navRevealAnimation?: string;
      navRevealDelay?: number;
      navRevealTranslate?: string;
    };
    setAttributes: (attrs: Record<string, unknown>) => void;
  }

  function renderWrapped(props: Props) {
    const Wrapped = applyFilters("editor.BlockEdit", OriginalEdit) as ComponentType<Props>;
    return render(<Wrapped {...props} />);
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Reveal on Menu Open/ }));
  }

  it("renders only the original edit for an excluded block type", () => {
    renderWrapped({
      name: "core/code",
      clientId: "in-nav",
      attributes: {},
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Reveal on Menu Open")).not.toBeInTheDocument();
  });

  it("shows the panel for core/navigation-link regardless of ancestor — architecturally it can't exist outside a navigation", () => {
    renderWrapped({
      name: "core/navigation-link",
      clientId: "outside-nav",
      attributes: {},
      setAttributes: jest.fn(),
    });

    expect(screen.queryByText("Reveal on Menu Open")).toBeInTheDocument();
  });

  it.each(["kotlinskidev/button", "kotlinskidev/social-section"])(
    "shows the panel for %s when nested inside a navigation",
    async (name) => {
      const user = userEvent.setup();
      renderWrapped({ name, clientId: "in-nav", attributes: {}, setAttributes: jest.fn() });
      await openPanel(user);

      expect(screen.getByRole("combobox", { name: "Animation Type" })).toBeInTheDocument();
    }
  );

  it.each([
    "kotlinskidev/social-section",
    "kotlinskidev/search-panel",
    "kotlinskidev/language-panel",
  ])(
    "shows the panel for %s even when it is not nested inside a navigation — these are standalone header dropdowns",
    async (name) => {
      const user = userEvent.setup();
      renderWrapped({ name, clientId: "outside-nav", attributes: {}, setAttributes: jest.fn() });
      await openPanel(user);

      expect(screen.getByRole("combobox", { name: "Animation Type" })).toBeInTheDocument();
    }
  );

  it("hides the panel for kotlinskidev/button when it is not nested inside a navigation", () => {
    renderWrapped({
      name: "kotlinskidev/button",
      clientId: "outside-nav",
      attributes: {},
      setAttributes: jest.fn(),
    });

    expect(screen.getByTestId("original-edit")).toBeInTheDocument();
    expect(screen.queryByText("Reveal on Menu Open")).not.toBeInTheDocument();
  });

  it("does not show the delay or distance controls until an animation is chosen", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      clientId: "in-nav",
      attributes: {},
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("combobox", { name: "Animation Type" })).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: /Reveal Delay/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Animation Distance" })).not.toBeInTheDocument();
  });

  it("shows the delay and distance controls once a non-flip animation is set", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      clientId: "in-nav",
      attributes: { navRevealAnimation: "fade-in-on-reveal" },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("spinbutton", { name: /Reveal Delay/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Animation Distance" })).toBeInTheDocument();
  });

  it("hides the distance control for flip animations", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      clientId: "in-nav",
      attributes: { navRevealAnimation: "flip-up-on-reveal" },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.queryByRole("combobox", { name: "Animation Distance" })).not.toBeInTheDocument();
  });

  it("offers the opacity-only Appear option and hides the distance control for it", async () => {
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      clientId: "in-nav",
      attributes: { navRevealAnimation: "appear-on-reveal" },
      setAttributes: jest.fn(),
    });
    await openPanel(user);

    expect(screen.getByRole("option", { name: "Appear" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /Reveal Delay/ })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Animation Distance" })).not.toBeInTheDocument();
  });

  it("updates the animation type", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      clientId: "in-nav",
      attributes: {},
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Type" }),
      "fade-up-on-reveal"
    );

    expect(setAttributes).toHaveBeenCalledWith({ navRevealAnimation: "fade-up-on-reveal" });
  });

  it("updates the reveal delay", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      clientId: "in-nav",
      attributes: { navRevealAnimation: "fade-in-on-reveal" },
      setAttributes,
    });
    await openPanel(user);

    const delayInput = screen.getByRole("spinbutton", { name: /Reveal Delay/ });
    await user.clear(delayInput);
    await user.type(delayInput, "150");

    expect(setAttributes).toHaveBeenCalledWith({ navRevealDelay: 150 });
  });

  it("updates the animation distance", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    renderWrapped({
      name: "core/navigation-link",
      clientId: "in-nav",
      attributes: { navRevealAnimation: "fade-in-on-reveal" },
      setAttributes,
    });
    await openPanel(user);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Animation Distance" }),
      "translate-lg"
    );

    expect(setAttributes).toHaveBeenCalledWith({ navRevealTranslate: "translate-lg" });
  });
});

describe("nav-reveal-animation — blocks.getSaveContent.extraProps filter", () => {
  it("leaves extraProps unchanged when there is no animation configured", () => {
    const extraProps = { className: "existing" };

    const result = applyFilters("blocks.getSaveContent.extraProps", extraProps, {}, {}) as {
      className: string;
    };

    expect(result.className).toBe("existing");
  });

  it("appends the animation and distance classes", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      { className: "existing" },
      {},
      { navRevealAnimation: "fade-in-on-reveal", navRevealTranslate: "translate-lg" }
    ) as { className: string };

    expect(result.className).toBe("existing fade-in-on-reveal translate-lg");
  });

  it("sets the --reveal-delay custom property when a delay is configured", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { navRevealAnimation: "fade-in-on-reveal", navRevealDelay: 150 }
    ) as { style: Record<string, string> };

    expect(result.style).toEqual({ "--reveal-delay": "150ms" });
  });

  it("does not set a style when there is no delay", () => {
    const result = applyFilters(
      "blocks.getSaveContent.extraProps",
      {},
      {},
      { navRevealAnimation: "fade-in-on-reveal" }
    ) as { style?: Record<string, string> };

    expect(result.style).toBeUndefined();
  });
});
