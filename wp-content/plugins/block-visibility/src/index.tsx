import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import React from 'react';
import './style.scss';

// 1. Add attribute to all blocks
addFilter(
  'blocks.registerBlockType',
  'block-visibility/attribute',
  (settings: any) => {
    if (!settings.attributes) settings.attributes = {};
    settings.attributes.visibility = {
      type: 'string',
      default: 'both',
    };
    return settings;
  }
);

// 2. Add control to block sidebar
const withVisibilityControl = createHigherOrderComponent((BlockEdit: any) => (props: any) => {
  const { attributes, setAttributes, isSelected } = props;
  return (
    <Fragment>
      <BlockEdit {...props} />
      {isSelected && (
        <InspectorControls>
          <PanelBody title={__('Visibility', 'block-visibility')}>
            <SelectControl
              label={__('Show on', 'block-visibility')}
              value={attributes.visibility || 'both'}
              options={[
                { label: __('Both', 'block-visibility'), value: 'both' },
                { label: __('Desktop only', 'block-visibility'), value: 'desktop' },
                { label: __('Mobile only', 'block-visibility'), value: 'mobile' },
              ]}
              onChange={(value) => setAttributes({ visibility: value })}
            />
          </PanelBody>
        </InspectorControls>
      )}
    </Fragment>
  );
}, 'withVisibilityControl');
addFilter('editor.BlockEdit', 'block-visibility/with-visibility-control', withVisibilityControl);

// 3. Add class to block wrapper
addFilter(
  'blocks.getSaveContent.extraProps',
  'block-visibility/class',
  (extraProps: any, _blockType: any, attributes: any) => {
    if (attributes.visibility && attributes.visibility !== 'both') {
      extraProps.className = (extraProps.className || '') + ` is-visible-${attributes.visibility}`;
    }
    return extraProps;
  }
);
