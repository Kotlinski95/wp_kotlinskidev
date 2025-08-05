import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import React from 'react';

// Define available scroll animations
const scrollAnimations = [
    { label: __('No Animation', 'kotlinskidev'), value: '' },
    { label: __('Fade In', 'kotlinskidev'), value: 'fade-in-on-scroll' },
    { label: __('Fade Up', 'kotlinskidev'), value: 'fade-up-on-scroll' },
    { label: __('Fade Left', 'kotlinskidev'), value: 'fade-left-on-scroll' },
    { label: __('Fade Right', 'kotlinskidev'), value: 'fade-right-on-scroll' },
];

// Add scroll animation attribute to all blocks
function addScrollAnimationAttribute(settings: any) {
    // Skip for certain core blocks that shouldn't have animations
    const excludedBlocks = [
        'core/html',
        'core/code',
        'core/preformatted',
        'core/verse'
    ];

    if (excludedBlocks.includes(settings.name)) {
        return settings;
    }

    // Add our custom attribute
    if (typeof settings.attributes !== 'undefined') {
        settings.attributes = {
            ...settings.attributes,
            scrollAnimation: {
                type: 'string',
                default: ''
            }
        };
    }

    return settings;
}

// Add animation controls to block inspector
const withScrollAnimationControls = createHigherOrderComponent((BlockEdit) => {
    return (props: any) => {
        const { attributes, setAttributes, name } = props;
        const { scrollAnimation } = attributes;

        // Skip for certain blocks
        const excludedBlocks = [
            'core/html',
            'core/code',
            'core/preformatted',
            'core/verse'
        ];

        if (excludedBlocks.includes(name)) {
            return <BlockEdit {...props} />;
        }

        return (
            <Fragment>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody
                        title={__('Scroll Animations', 'kotlinskidev')}
                        icon="art"
                        initialOpen={false}
                    >
                        <SelectControl
                            label={__('Animation Type', 'kotlinskidev')}
                            value={scrollAnimation || ''}
                            options={scrollAnimations}
                            onChange={(value: string) => setAttributes({ scrollAnimation: value })}
                            help={__('Choose an animation that will trigger when the block comes into view.', 'kotlinskidev')}
                        />
                    </PanelBody>
                </InspectorControls>
            </Fragment>
        );
    };
}, 'withScrollAnimationControls');

// Apply animation class to block wrapper
function applyScrollAnimationClass(extraProps: any, blockType: any, attributes: any) {
    const { scrollAnimation } = attributes;
    
    if (scrollAnimation) {
        extraProps.className = extraProps.className 
            ? `${extraProps.className} ${scrollAnimation}` 
            : scrollAnimation;
    }
    
    return extraProps;
}

// Register the filters
addFilter(
    'blocks.registerBlockType',
    'kotlinskidev/scroll-animation-attribute',
    addScrollAnimationAttribute
);

addFilter(
    'editor.BlockEdit',
    'kotlinskidev/scroll-animation-controls',
    withScrollAnimationControls
);

addFilter(
    'blocks.getSaveContent.extraProps',
    'kotlinskidev/scroll-animation-class',
    applyScrollAnimationClass
);
