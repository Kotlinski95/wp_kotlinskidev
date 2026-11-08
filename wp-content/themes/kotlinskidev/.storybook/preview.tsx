import React, { useEffect } from "react";
import type { Preview } from "@storybook/react-webpack5";
import { SlotFillProvider } from "@wordpress/components";
import { InspectorControls } from "@wordpress/block-editor";
import { getBlockType } from "@wordpress/blocks";
import { registerCoreBlocks } from "@wordpress/block-library";
import "@wordpress/core-data";
import "./mock-media-upload";
import { buildWpPresetStylesheet } from "./wp-preset-tokens";
import "@wordpress/components/build-style/style.css";
import "@wordpress/block-editor/build-style/style.css";
import "@wordpress/block-editor/build-style/content.css";
import "@wordpress/block-library/build-style/style.css";
import "@wordpress/block-library/build-style/editor.css";
import "@wordpress/block-library/build-style/elements.css";
import "../src/critical.scss";
import "../src/index.scss";
import "../src/styles/editor-overrides.scss";
import "./frame.scss";

if (!getBlockType("core/paragraph")) {
  registerCoreBlocks();
}

const presetStyleTag = document.createElement("style");
presetStyleTag.textContent = buildWpPresetStylesheet();
document.head.appendChild(presetStyleTag);

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Blocks"],
      },
    },
    viewport: {
      options: {
        mobile: { name: "Mobile (390px)", styles: { width: "390px", height: "844px" } },
        breakpointEdge: {
          name: "kotlinskidev breakpoint edge (782px)",
          styles: { width: "782px", height: "1024px" },
        },
        desktop: { name: "Desktop (1280px)", styles: { width: "1280px", height: "800px" } },
      },
    },
  },
  globalTypes: {
    theme: {
      description: "kotlinskidev light/dark theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light mode" },
          { value: "dark", title: "Dark mode" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const mode = context.globals.theme === "dark" ? "dark-mode" : "light-mode";

      useEffect(() => {
        document.documentElement.classList.remove("dark-mode", "light-mode");
        document.documentElement.classList.add(mode);
        document.body.classList.remove("dark-mode", "light-mode");
        document.body.classList.add(mode);
      }, [mode]);

      return (
        <SlotFillProvider>
          <div className={`editor-styles-wrapper kt-storybook-frame ${mode}`}>
            <div className="kt-storybook-frame__main">
              <Story />
            </div>
            <div className="kt-storybook-frame__sidebar">
              <InspectorControls.Slot />
            </div>
          </div>
        </SlotFillProvider>
      );
    },
  ],
};

export default preview;
