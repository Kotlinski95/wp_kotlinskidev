import React from "react";
import { ColorPalette } from "@wordpress/block-editor";
import { BaseControl, PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { BlurAmountControl, BLUR_AMOUNT_DEFAULT_VALUE } from "../shared/blur-amount-control";
import { barBackgroundToColor, colorToBarBackground, PaletteColor } from "./bar-background";
import {
  displayModeOptions,
  hamburgerLineAlignOptions,
  overlayMenuOptions,
  overlaySlideOptions,
  visibilityOptions,
} from "./navigation-options";
import type {
  DisplayMode,
  HorizontalSide,
  NavigationPanelProps,
  OverlayMenu,
  Visibility,
} from "./navigation-types";

interface MenuOption {
  label: string;
  value: string;
}

interface BarBackgroundFieldProps extends NavigationPanelProps {
  paletteColors: PaletteColor[];
}

const BarBackgroundField = ({
  attributes,
  setAttributes,
  paletteColors,
}: BarBackgroundFieldProps): JSX.Element => (
  <BaseControl
    id="kt-nav-bar-solid-background"
    label={__("Bar background while loading", "kotlinskidev")}
    help={__(
      "Solid colour shown while a page loads or changes, before the glass blur returns. Empty uses the site background.",
      "kotlinskidev"
    )}
    __nextHasNoMarginBottom
  >
    <ColorPalette
      colors={paletteColors}
      value={barBackgroundToColor(attributes.barSolidBackground, paletteColors)}
      onChange={(color) =>
        setAttributes({ barSolidBackground: colorToBarBackground(color, paletteColors) })
      }
      clearable
    />
  </BaseControl>
);

const HamburgerFields = ({ attributes, setAttributes }: NavigationPanelProps): JSX.Element => (
  <>
    <SelectControl
      label={__("Overlay slide direction", "kotlinskidev")}
      value={attributes.overlaySlide}
      options={overlaySlideOptions}
      onChange={(overlaySlide) => setAttributes({ overlaySlide: overlaySlide as HorizontalSide })}
    />
    <SelectControl
      label={__("Hamburger short line alignment", "kotlinskidev")}
      value={attributes.hamburgerLineAlign}
      options={hamburgerLineAlignOptions}
      onChange={(hamburgerLineAlign) =>
        setAttributes({ hamburgerLineAlign: hamburgerLineAlign as HorizontalSide })
      }
    />
    <ToggleControl
      label={__("Show hamburger border", "kotlinskidev")}
      help={__(
        "Adds a border around the hamburger icon button. Applies the same way whether this block is placed as the desktop or mobile hamburger.",
        "kotlinskidev"
      )}
      checked={attributes.showHamburgerBorder}
      onChange={(showHamburgerBorder) => setAttributes({ showHamburgerBorder })}
      __nextHasNoMarginBottom
    />
    <ToggleControl
      label={__("Hide accordion dividers", "kotlinskidev")}
      help={__(
        "Removes the divider lines between items in the hamburger panel, including nested accordion children. Doesn't change content or expand/collapse behavior.",
        "kotlinskidev"
      )}
      checked={attributes.hideAccordionDividers}
      onChange={(hideAccordionDividers) => setAttributes({ hideAccordionDividers })}
      __nextHasNoMarginBottom
    />
  </>
);

const OverlayAndVisibilityFields = ({
  attributes,
  setAttributes,
}: NavigationPanelProps): JSX.Element => (
  <>
    <SelectControl
      label={__("Overlay mode", "kotlinskidev")}
      value={attributes.overlayMenu}
      options={overlayMenuOptions}
      onChange={(overlayMenu) => setAttributes({ overlayMenu: overlayMenu as OverlayMenu })}
    />
    <SelectControl
      label={__("Visibility", "kotlinskidev")}
      help={__("Choose on which screen sizes this navigation renders.", "kotlinskidev")}
      value={attributes.visibility}
      options={visibilityOptions}
      onChange={(visibility) => setAttributes({ visibility: visibility as Visibility })}
    />
  </>
);

interface NavigationPanelFieldsProps extends BarBackgroundFieldProps {
  menuOptions: MenuOption[];
}

const MenuModeFields = ({
  attributes,
  setAttributes,
  paletteColors,
  menuOptions,
}: NavigationPanelFieldsProps): JSX.Element => (
  <>
    <SelectControl
      label={__("Navigation menu", "kotlinskidev")}
      value={attributes.menuSlug}
      options={menuOptions}
      onChange={(menuSlug) => setAttributes({ menuSlug })}
    />
    <SelectControl
      label={__("Display mode", "kotlinskidev")}
      help={__(
        "Flat link list renders top-level links only, e.g. footer link columns.",
        "kotlinskidev"
      )}
      value={attributes.displayMode}
      options={displayModeOptions}
      onChange={(displayMode) => setAttributes({ displayMode: displayMode as DisplayMode })}
    />
    {attributes.displayMode === "bar" && (
      <BarBackgroundField
        attributes={attributes}
        setAttributes={setAttributes}
        paletteColors={paletteColors}
      />
    )}
    <OverlayAndVisibilityFields attributes={attributes} setAttributes={setAttributes} />
  </>
);

export const NavigationPanel = (props: NavigationPanelFieldsProps): JSX.Element => {
  const { attributes, setAttributes } = props;

  return (
    <PanelBody title={__("Navigation", "kotlinskidev")} initialOpen={true}>
      <MenuModeFields {...props} />
      {attributes.overlayMenu === "always" && (
        <HamburgerFields attributes={attributes} setAttributes={setAttributes} />
      )}
      <ToggleControl
        label={__("Navigate top-level links on click", "kotlinskidev")}
        help={__(
          "When on, clicking a link with a real URL navigates to it. Links with '#' or no URL still toggle the panel.",
          "kotlinskidev"
        )}
        checked={attributes.linkNavigatesOnClick}
        onChange={(linkNavigatesOnClick) => setAttributes({ linkNavigatesOnClick })}
      />
    </PanelBody>
  );
};

export const BlurPanel = ({ attributes, setAttributes }: NavigationPanelProps): JSX.Element => (
  <PanelBody title={__("Blur Inactive Links on Hover", "kotlinskidev")} initialOpen={false}>
    <ToggleControl
      label={__("Blur inactive links on hover", "kotlinskidev")}
      help={__(
        "Hovering one top-level link dims and blurs the rest of the bar. Turn off anytime to revert.",
        "kotlinskidev"
      )}
      checked={attributes.blurInactiveLinks}
      onChange={(blurInactiveLinks) => setAttributes({ blurInactiveLinks })}
      __nextHasNoMarginBottom
    />
    {attributes.blurInactiveLinks && (
      <>
        <ToggleControl
          label={__("Include search & language", "kotlinskidev")}
          help={__(
            "Off: only dropdown links (nav links/submenus) blur. On: the search and language items blur and trigger the effect too.",
            "kotlinskidev"
          )}
          checked={attributes.blurIncludeUtility}
          onChange={(blurIncludeUtility) => setAttributes({ blurIncludeUtility })}
          __nextHasNoMarginBottom
        />
        <BlurAmountControl
          value={attributes.blurAmount || BLUR_AMOUNT_DEFAULT_VALUE}
          onChange={(blurAmount) => setAttributes({ blurAmount })}
        />
      </>
    )}
  </PanelBody>
);
