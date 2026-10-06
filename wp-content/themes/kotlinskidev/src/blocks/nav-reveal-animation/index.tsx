import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";
import React from "react";
import {
  ANIMATION_TRANSLATE_OPTIONS,
  buildAnimationTypeOptions,
  supportsDistanceControl,
} from "@utils/animation-options";

const navRevealAnimations = buildAnimationTypeOptions("reveal");

const navRevealTranslates = ANIMATION_TRANSLATE_OPTIONS;

const NAME_SCOPED_BLOCKS = [
  "core/navigation-link",
  "core/navigation-submenu",
  "kotlinskidev/nav-link",
  "kotlinskidev/nav-banner",
  "kotlinskidev/nav-image",
  "kotlinskidev/nav-paragraph",
  "kotlinskidev/nav-search-panel",
  "kotlinskidev/nav-language-panel",
  "kotlinskidev/nav-popular-pages",
  "kotlinskidev/social-section",
  "kotlinskidev/search-panel",
  "kotlinskidev/language-panel",
];

const NAVIGATION_ANCESTOR_GATED_BLOCKS = ["kotlinskidev/button"];

const ALL_SCOPED_BLOCKS = [...NAME_SCOPED_BLOCKS, ...NAVIGATION_ANCESTOR_GATED_BLOCKS];

function addNavRevealAttribute(settings: any) {
  if (!ALL_SCOPED_BLOCKS.includes(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      navRevealAnimation: {
        type: "string",
        default: "",
      },
      navRevealDelay: {
        type: "number",
        default: 0,
      },
      navRevealTranslate: {
        type: "string",
        default: "",
      },
    };
  }

  return settings;
}

const withNavRevealControls = createHigherOrderComponent((BlockEdit) => {
  return (props: any) => {
    const { attributes, setAttributes, name, clientId } = props;
    const { navRevealAnimation, navRevealDelay, navRevealTranslate } = attributes;

    const isAllowed = useSelect(
      (select) => {
        if (NAME_SCOPED_BLOCKS.includes(name)) {
          return true;
        }
        if (!NAVIGATION_ANCESTOR_GATED_BLOCKS.includes(name)) {
          return false;
        }
        const blockEditor = select("core/block-editor") as {
          getBlockParentsByBlockName: (clientId: string, blockName: string) => string[];
        };
        return blockEditor.getBlockParentsByBlockName(clientId, "core/navigation").length > 0;
      },
      [name, clientId]
    );

    if (!isAllowed) {
      return <BlockEdit {...props} />;
    }

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody
            title={__("Reveal on Menu Open", "kotlinskidev")}
            icon="controls-forward"
            initialOpen={false}
          >
            <SelectControl
              label={__("Animation Type", "kotlinskidev")}
              value={navRevealAnimation || ""}
              options={navRevealAnimations}
              onChange={(value: string) => setAttributes({ navRevealAnimation: value })}
              help={__(
                "Choose an animation that will trigger when the enclosing nav panel, hamburger menu, or dropdown opens.",
                "kotlinskidev"
              )}
            />
            {navRevealAnimation && (
              <NumberControl
                label={__("Reveal Delay (ms)", "kotlinskidev")}
                value={navRevealDelay || 0}
                min={0}
                step={10}
                onChange={(value?: string) => setAttributes({ navRevealDelay: Number(value) || 0 })}
                help={__(
                  "Stagger links by setting an increasing delay on each one, e.g. 50, 100, 150.",
                  "kotlinskidev"
                )}
              />
            )}
            {supportsDistanceControl(navRevealAnimation || "") && (
              <SelectControl
                label={__("Animation Distance", "kotlinskidev")}
                value={navRevealTranslate || ""}
                options={navRevealTranslates}
                onChange={(value: string) => setAttributes({ navRevealTranslate: value })}
                help={__(
                  "Control how far elements move during fade/slide animations.",
                  "kotlinskidev"
                )}
              />
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withNavRevealControls");

function applyNavRevealProps(extraProps: any, blockType: any, attributes: any) {
  const { navRevealAnimation, navRevealDelay, navRevealTranslate } = attributes;

  if (!navRevealAnimation) {
    return extraProps;
  }

  const classes = [navRevealAnimation];

  if (navRevealTranslate) {
    classes.push(navRevealTranslate);
  }

  const classString = classes.join(" ");
  extraProps.className = extraProps.className
    ? `${extraProps.className} ${classString}`
    : classString;

  if (navRevealDelay) {
    extraProps.style = {
      ...extraProps.style,
      "--reveal-delay": `${navRevealDelay}ms`,
    };
  }

  return extraProps;
}

addFilter("blocks.registerBlockType", "kotlinskidev/nav-reveal-attribute", addNavRevealAttribute);

addFilter("editor.BlockEdit", "kotlinskidev/nav-reveal-controls", withNavRevealControls);

addFilter("blocks.getSaveContent.extraProps", "kotlinskidev/nav-reveal-class", applyNavRevealProps);
