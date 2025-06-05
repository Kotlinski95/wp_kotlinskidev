import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck, InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody, TextControl, RangeControl } from '@wordpress/components';
import React from 'react';

interface ResponsiveImageEditProps {
  attributes: {
    desktopImageUrl?: string;
    desktopImageId?: number;
    mobileImageUrl?: string;
    mobileImageId?: number;
    alt?: string;
    breakpoint?: number;
  };
  setAttributes: (attrs: any) => void;
}

export default function Edit({ attributes, setAttributes }: ResponsiveImageEditProps) {
  const { desktopImageUrl = '', desktopImageId, mobileImageUrl = '', mobileImageId, alt = '', breakpoint = 767 } = attributes;

  return (
    <div {...useBlockProps()}>
      <InspectorControls>
        <PanelBody title={__('Image Settings', 'responsive-image')}>
          <TextControl
            label={__('Alt Text', 'responsive-image')}
            value={alt}
            onChange={(value) => setAttributes({ alt: value })}
          />
        </PanelBody>
      </InspectorControls>
      <div style={{ marginBottom: 16 }}>
        <RangeControl
          label={__('Mobile Breakpoint (px)', 'responsive-image')}
          value={breakpoint}
          onChange={(value) => setAttributes({ breakpoint: value })}
          min={320}
          max={1920}
          help={__('Switch to mobile image at this screen width or below.', 'responsive-image')}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>{__('Desktop Image', 'responsive-image')}</strong>
        <MediaUploadCheck>
          <MediaUpload
            onSelect={(media: any) => setAttributes({ desktopImageUrl: media.url, desktopImageId: media.id })}
            allowedTypes={['image']}
            value={desktopImageId}
            render={({ open }) => (
              <Button onClick={open} isSecondary>
                {desktopImageUrl ? __('Replace Image', 'responsive-image') : __('Select Image', 'responsive-image')}
              </Button>
            )}
          />
        </MediaUploadCheck>
        {desktopImageUrl && (
          <img src={desktopImageUrl} alt={alt} style={{ maxWidth: '100%', marginTop: 8 }} />
        )}
      </div>
      <div>
        <strong>{__('Mobile Image (optional)', 'responsive-image')}</strong>
        <MediaUploadCheck>
          <MediaUpload
            onSelect={(media: any) => setAttributes({ mobileImageUrl: media.url, mobileImageId: media.id })}
            allowedTypes={['image']}
            value={mobileImageId}
            render={({ open }) => (
              <Button onClick={open} isSecondary>
                {mobileImageUrl ? __('Replace Image', 'responsive-image') : __('Select Image', 'responsive-image')}
              </Button>
            )}
          />
        </MediaUploadCheck>
        {mobileImageUrl && (
          <img src={mobileImageUrl} alt={alt} style={{ maxWidth: '100%', marginTop: 8 }} />
        )}
      </div>
    </div>
  );
}
