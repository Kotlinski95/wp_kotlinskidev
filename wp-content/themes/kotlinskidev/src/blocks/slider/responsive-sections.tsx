import React, { useId } from "react";
import { Icon } from "@wordpress/icons";
import { RESPONSIVE_SECTION_ICON_SIZE } from "./constants";

interface ResponsiveSectionProps {
  icon: React.ComponentProps<typeof Icon>["icon"];
  title: string;
  range: string;
  children: React.ReactNode;
}

export const ResponsiveSection = ({
  icon,
  title,
  range,
  children,
}: ResponsiveSectionProps): React.ReactElement => {
  const headingId = useId();
  return (
    <div className="kt-slider-responsive-section" role="group" aria-labelledby={headingId}>
      <div className="kt-slider-responsive-section__heading">
        <Icon icon={icon} size={RESPONSIVE_SECTION_ICON_SIZE} />
        <strong id={headingId}>{title}</strong>
        <span className="kt-slider-responsive-section__range">{range}</span>
      </div>
      {children}
    </div>
  );
};

export const ResponsiveSubSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement => {
  const headingId = useId();
  return (
    <div className="kt-slider-responsive-subsection" role="group" aria-labelledby={headingId}>
      <span className="kt-slider-responsive-subsection__title" id={headingId}>
        {title}
      </span>
      {children}
    </div>
  );
};
