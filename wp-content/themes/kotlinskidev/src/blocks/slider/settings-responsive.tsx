import React from "react";
import { RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { desktop, mobile, tablet } from "@wordpress/icons";
import SlidesPerViewControl from "@utils/carousel/SlidesPerViewControl";
import { MAX_SPACE_BETWEEN_PX, SLIDES_PER_VIEW_STEP } from "./constants";
import { ResponsiveSection, ResponsiveSubSection } from "./responsive-sections";
import type { SliderSettingsProps } from "./slider-attributes";

const DesktopSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <ResponsiveSection
    icon={desktop}
    title={__("Desktop", "kotlinskidev")}
    range={__("1024px and wider", "kotlinskidev")}
  >
    <SlidesPerViewControl
      label={__("Slides Per View", "kotlinskidev")}
      value={attributes.slidesPerDesktop}
      step={SLIDES_PER_VIEW_STEP}
      onChange={(value) => setAttributes({ slidesPerDesktop: value })}
    />
    <RangeControl
      label={__("Space Between Slides (px)", "kotlinskidev")}
      value={attributes.spaceBetween}
      onChange={(value) => setAttributes({ spaceBetween: value })}
      min={0}
      max={MAX_SPACE_BETWEEN_PX}
      help={__(
        "Space between slides in pixels. Also used for tablet and mobile unless set below.",
        "kotlinskidev"
      )}
    />
  </ResponsiveSection>
);

const TabletSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <ResponsiveSection
    icon={tablet}
    title={__("Tablet", "kotlinskidev")}
    range={__("768px to 1023px", "kotlinskidev")}
  >
    <SlidesPerViewControl
      label={__("Slides Per View", "kotlinskidev")}
      value={attributes.slidesPerTablet}
      step={SLIDES_PER_VIEW_STEP}
      onChange={(value) => setAttributes({ slidesPerTablet: value })}
    />
    <RangeControl
      label={__("Space Between (Tablet)", "kotlinskidev")}
      value={attributes.spaceBetweenTablet ?? attributes.spaceBetween}
      onChange={(value) => setAttributes({ spaceBetweenTablet: value })}
      min={0}
      max={MAX_SPACE_BETWEEN_PX}
      allowReset
    />
  </ResponsiveSection>
);

const MobileSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <ResponsiveSection
    icon={mobile}
    title={__("Mobile", "kotlinskidev")}
    range={__("Below 768px", "kotlinskidev")}
  >
    <ResponsiveSubSection title={__("Phones (<640px)", "kotlinskidev")}>
      <SlidesPerViewControl
        label={__("Slides Per View", "kotlinskidev")}
        value={attributes.slidesPerView}
        step={SLIDES_PER_VIEW_STEP}
        onChange={(value) => setAttributes({ slidesPerView: value })}
      />
      <RangeControl
        label={__("Space Between (Mobile)", "kotlinskidev")}
        value={attributes.spaceBetweenMobile ?? attributes.spaceBetween}
        onChange={(value) => setAttributes({ spaceBetweenMobile: value })}
        min={0}
        max={MAX_SPACE_BETWEEN_PX}
        allowReset
        help={__("Also applies to large phones (640–767px).", "kotlinskidev")}
      />
    </ResponsiveSubSection>
    <ResponsiveSubSection title={__("Large phones (640–767px)", "kotlinskidev")}>
      <SlidesPerViewControl
        label={__("Slides Per View", "kotlinskidev")}
        value={attributes.slidesPerMobile}
        step={SLIDES_PER_VIEW_STEP}
        onChange={(value) => setAttributes({ slidesPerMobile: value })}
      />
    </ResponsiveSubSection>
  </ResponsiveSection>
);

export const ResponsiveSettings = (props: SliderSettingsProps) => (
  <>
    <DesktopSettings {...props} />
    <TabletSettings {...props} />
    <MobileSettings {...props} />
  </>
);
