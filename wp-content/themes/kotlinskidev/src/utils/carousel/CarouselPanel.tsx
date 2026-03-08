import React from 'react';
import { PanelBody, RangeControl, ToggleControl, SelectControl, ColorPicker, BaseControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { CarouselSettings, CarouselFeatures } from './types';

interface CarouselPanelProps {
  settings: Partial<CarouselSettings>;
  onChange: (partial: Partial<CarouselSettings>) => void;
  features?: CarouselFeatures;
  title?: string;
}

export default function CarouselPanel({
  settings,
  onChange,
  features = {},
  title,
}: CarouselPanelProps) {
  const {
    showArrows = true,
    showPagination = true,
    showScrollbar = false,
    loop = true,
    autoplay = false,
    autoplayDelay = 3000,
    slidesPerView = 1,
    slidesPerMobile = 1,
    slidesPerTablet = 1,
    slidesPerDesktop = 1,
    lazyLoad = false,
    arrowsPosition = 'sides',
    navColor = '',
    navPlacement = 'inside',
    trackActiveSlide = false,
  } = settings;

  return (
    <PanelBody title={title ?? __('Carousel Settings', 'kotlinskidev')} initialOpen={true}>
      <ToggleControl
        label={__('Show Arrows', 'kotlinskidev')}
        checked={showArrows}
        onChange={(value) => onChange({ showArrows: value })}
      />
      {showArrows && features.arrowsPosition && (
        <SelectControl
          label={__('Arrows Position', 'kotlinskidev')}
          value={arrowsPosition}
          options={[
            { label: __('Default (sides)', 'kotlinskidev'), value: 'sides' },
            { label: __('Bottom left', 'kotlinskidev'), value: 'bottom-left' },
            { label: __('Bottom center', 'kotlinskidev'), value: 'bottom-center' },
            { label: __('Bottom right', 'kotlinskidev'), value: 'bottom-right' },
          ]}
          onChange={(value) => onChange({ arrowsPosition: value as CarouselSettings['arrowsPosition'] })}
        />
      )}
      {showArrows && features.navPlacement && (
        <ToggleControl
          label={__('Show navigation outside carousel', 'kotlinskidev')}
          help={__('Renders nav below the slides instead of overlaying them.', 'kotlinskidev')}
          checked={navPlacement === 'outside'}
          onChange={(value) => {
            const updates: Partial<CarouselSettings> = { navPlacement: value ? 'outside' : 'inside' };
            if (value && arrowsPosition === 'sides') {
              updates.arrowsPosition = 'bottom-center';
            }
            onChange(updates);
          }}
        />
      )}
      {showArrows && features.navColor && (navPlacement === 'outside' || arrowsPosition !== 'sides') && (
        <>
          <ToggleControl
            label={__('Use custom navigation color', 'kotlinskidev')}
            checked={!!navColor}
            onChange={(value) => onChange({ navColor: value ? '#ffffff' : '' })}
          />
          {!!navColor && (
            <BaseControl
              label={__('Navigation Color', 'kotlinskidev')}
              id="carousel-nav-color"
              __nextHasNoMarginBottom
            >
              <ColorPicker
                color={navColor}
                onChange={(value) => onChange({ navColor: value })}
                enableAlpha={false}
                copyFormat="hex"
              />
            </BaseControl>
          )}
        </>
      )}
      <ToggleControl
        label={__('Show Pagination', 'kotlinskidev')}
        checked={showPagination}
        onChange={(value) => onChange({ showPagination: value })}
      />
      {features.scrollbar && (
        <ToggleControl
          label={__('Show Scrollbar', 'kotlinskidev')}
          checked={showScrollbar}
          onChange={(value) => onChange({ showScrollbar: value })}
        />
      )}
      <ToggleControl
        label={__('Loop Mode', 'kotlinskidev')}
        checked={loop}
        onChange={(value) => onChange({ loop: value })}
      />
      {features.autoplay !== false && (
        <>
          <ToggleControl
            label={__('Autoplay', 'kotlinskidev')}
            checked={autoplay}
            onChange={(value) => onChange({ autoplay: value })}
          />
          {autoplay && (
            <RangeControl
              label={__('Autoplay Delay (seconds)', 'kotlinskidev')}
              value={autoplayDelay / 1000}
              onChange={(value) => onChange({ autoplayDelay: (value ?? 3) * 1000 })}
              min={1}
              max={10}
            />
          )}
        </>
      )}
      {features.lazyLoad !== false && (
        <ToggleControl
          label={__('Lazy Load First Image', 'kotlinskidev')}
          help={__('Enable if this block is below the fold.', 'kotlinskidev')}
          checked={lazyLoad}
          onChange={(value) => onChange({ lazyLoad: value })}
        />
      )}
      {features.trackActiveSlide && (
        <ToggleControl
          label={__('Track active slide', 'kotlinskidev')}
          help={__('Keeps the featured image and counter in sync with the last viewed slide.', 'kotlinskidev')}
          checked={trackActiveSlide}
          onChange={(value) => onChange({ trackActiveSlide: value })}
        />
      )}
      {features.slidesPerBreakpoint && (
        <>
          <RangeControl
            label={__('Slides Per View', 'kotlinskidev')}
            value={slidesPerView}
            onChange={(value) => onChange({ slidesPerView: value ?? 1 })}
            min={1}
            max={5}
          />
          <RangeControl
            label={__('Slides (Mobile)', 'kotlinskidev')}
            value={slidesPerMobile}
            onChange={(value) => onChange({ slidesPerMobile: value ?? 1 })}
            min={1}
            max={5}
          />
          <RangeControl
            label={__('Slides (Tablet)', 'kotlinskidev')}
            value={slidesPerTablet}
            onChange={(value) => onChange({ slidesPerTablet: value ?? 1 })}
            min={1}
            max={5}
          />
          <RangeControl
            label={__('Slides (Desktop)', 'kotlinskidev')}
            value={slidesPerDesktop}
            onChange={(value) => onChange({ slidesPerDesktop: value ?? 1 })}
            min={1}
            max={5}
          />
        </>
      )}
    </PanelBody>
  );
}
