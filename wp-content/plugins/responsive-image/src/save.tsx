import { useBlockProps } from '@wordpress/block-editor';
import React from 'react';

export default function save({ attributes }: any) {
  const { desktopImageUrl, mobileImageUrl, alt, breakpoint = 767, loading = 'lazy' } = attributes;
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
