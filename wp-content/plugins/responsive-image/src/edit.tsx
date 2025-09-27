import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck, InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody, TextControl, RangeControl, SelectControl } from '@wordpress/components';
import React from 'react';

interface ResponsiveImageEditProps {
  attributes: {
    desktopImageUrl?: string;
    desktopImageId?: number;
    mobileImageUrl?: string;
    mobileImageId?: number;
    alt?: string;
    breakpoint?: number;
    loading?: 'lazy' | 'eager' | 'auto';
  };
  setAttributes: (attrs: any) => void;
}

export default function Edit({ attributes, setAttributes }: ResponsiveImageEditProps) {
  const { desktopImageUrl = '', desktopImageId, mobileImageUrl = '', mobileImageId, alt = '', breakpoint = 767, loading = 'lazy' } = attributes;

  return (
    <div {...useBlockProps()}>
      <InspectorControls>
        <PanelBody title={__('Image Settings', 'responsive-image')}>
          <TextControl
            label={__('Alt Text', 'responsive-image')}
            value={alt}
            onChange={(value) => setAttributes({ alt: value })}
          />
          <RangeControl
            label={__('Mobile Breakpoint (rem)', 'responsive-image')}
            value={breakpoint}
            onChange={(value) => setAttributes({ breakpoint: value })}
            min={320}
            max={1920}
            help={__('Switch to mobile image at this screen width or below.', 'responsive-image')}
          />
          <SelectControl
            label={__('Image Loading', 'responsive-image')}
            value={loading}
            options={[
              { label: __('Lazy', 'responsive-image'), value: 'lazy' },
              { label: __('Eager', 'responsive-image'), value: 'eager' },
              { label: __('Auto', 'responsive-image'), value: 'auto' },
            ]}
            onChange={(value) => setAttributes({ loading: value })}
            help={__('Choose how the image should be loaded by the browser.', 'responsive-image')}
          />
        </PanelBody>
      </InspectorControls>
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
