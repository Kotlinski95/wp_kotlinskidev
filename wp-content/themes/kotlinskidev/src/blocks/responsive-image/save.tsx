import React from "react";
import { useBlockProps } from "@wordpress/block-editor";

interface ResponsiveImageAttributes {
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  alt?: string;
  breakpoint?: number;
  loading?: "lazy" | "eager" | "auto";
}

export default function save({
  attributes,
}: {
  attributes: ResponsiveImageAttributes;
}): React.ReactElement {
  const { desktopImageUrl, mobileImageUrl, alt, breakpoint = 767, loading = "lazy" } = attributes;

  return (
    <div {...useBlockProps.save()}>
      <picture>
        {mobileImageUrl && (
          <source srcSet={mobileImageUrl} media={`(max-width: ${breakpoint}px)`} />
        )}
        <img src={desktopImageUrl || mobileImageUrl} alt={alt} loading={loading} />
      </picture>
    </div>
  );
}
