import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, RangeControl, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import React from 'react';

// Define animation durations
const animationDurations = [
    { label: __('Fast (1s)', 'kotlinskidev'), value: '1000' },
    { label: __('Normal (2s)', 'kotlinskidev'), value: '2000' },
    { label: __('Slow (3s)', 'kotlinskidev'), value: '3000' },
    { label: __('Very Slow (4s)', 'kotlinskidev'), value: '4000' },
    { label: __('Custom', 'kotlinskidev'), value: 'custom' },
];

// Define easing functions
const easingFunctions = [
    { label: __('Linear', 'kotlinskidev'), value: 'linear' },
    { label: __('Ease Out', 'kotlinskidev'), value: 'easeOut' },
    { label: __('Ease In Out', 'kotlinskidev'), value: 'easeInOut' },
    { label: __('Bounce', 'kotlinskidev'), value: 'bounce' },
];

// Add counter animation attributes to supported blocks
function addCounterAnimationAttribute(settings: any) {
    // Only add to blocks that can contain numbers (headings, paragraphs, etc.)
    const supportedBlocks = [
        'core/heading',
        'core/paragraph',
        'core/group',
        'core/column',
        'core/columns',
        'core/cover'
    ];

    if (!supportedBlocks.includes(settings.name)) {
        return settings;
    }

    // Add our custom attributes
    if (typeof settings.attributes !== 'undefined') {
        settings.attributes = {
            ...settings.attributes,
            enableCounter: {
                type: 'boolean',
                default: false
            },
            counterDuration: {
                type: 'string',
                default: '2000'
            },
            counterCustomDuration: {
                type: 'number',
                default: 2000
            },
            counterEasing: {
                type: 'string',
                default: 'easeOut'
            }
        };
    }

    return settings;
}

// Add counter animation controls to block inspector
const withCounterAnimationControls = createHigherOrderComponent((BlockEdit) => {
    return (props: any) => {
        const { attributes, setAttributes, name } = props;
        const { 
            enableCounter,
            counterDuration,
            counterCustomDuration,
            counterEasing
        } = attributes;

        // Only show controls for supported blocks
        const supportedBlocks = [
            'core/heading',
            'core/paragraph',
            'core/group',
            'core/column',
            'core/columns',
            'core/cover'
        ];

        if (!supportedBlocks.includes(name)) {
            return <BlockEdit {...props} />;
        }

        return (
            <Fragment>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody
                        title={__('Animated Counter', 'kotlinskidev')}
                        icon="chart-line"
                        initialOpen={false}
                    >
                        <ToggleControl
                            label={__('Enable Counter Animation', 'kotlinskidev')}
                            checked={enableCounter || false}
                            onChange={(value: boolean) => setAttributes({ enableCounter: value })}
                            help={__('Turn this block into an animated counter. Numbers in your text will automatically count up from 0 when the block comes into view.', 'kotlinskidev')}
                        />

                        {enableCounter && (
                            <Fragment>
                                <div style={{ 
                                    padding: '12px', 
                                    backgroundColor: '#f0f6fc', 
                                    borderRadius: '4px', 
                                    marginBottom: '16px',
                                    border: '1px solid #0073aa'
                                }}>
                                    <p style={{ 
                                        margin: '0 0 8px 0', 
                                        fontSize: '13px', 
                                        fontWeight: '600',
                                        color: '#0073aa'
                                    }}>
                                        {__('💡 How it works:', 'kotlinskidev')}
                                    </p>
                                    <p style={{ 
                                        margin: '0', 
                                        fontSize: '12px', 
                                        color: '#555',
                                        lineHeight: '1.4'
                                    }}>
                                        {__('Just type your text with numbers like "5 years", "98%", or "$1,250". The system will automatically detect the numbers and animate them from 0 to the detected value.', 'kotlinskidev')}
                                    </p>
                                </div>

                                <SelectControl
                                    label={__('Animation Duration', 'kotlinskidev')}
                                    value={counterDuration || '2000'}
                                    options={animationDurations}
                                    onChange={(value: string) => setAttributes({ counterDuration: value })}
                                    help={__('How long the counting animation should take.', 'kotlinskidev')}
                                />

                                {counterDuration === 'custom' && (
                                    <RangeControl
                                        label={__('Custom Duration (ms)', 'kotlinskidev')}
                                        value={counterCustomDuration || 2000}
                                        onChange={(value: number) => setAttributes({ counterCustomDuration: value })}
                                        min={500}
                                        max={10000}
                                        step={100}
                                    />
                                )}

                                <SelectControl
                                    label={__('Animation Easing', 'kotlinskidev')}
                                    value={counterEasing || 'easeOut'}
                                    options={easingFunctions}
                                    onChange={(value: string) => setAttributes({ counterEasing: value })}
                                    help={__('The animation style (how fast/slow it accelerates).', 'kotlinskidev')}
                                />
                            </Fragment>
                        )}
                    </PanelBody>
                </InspectorControls>
            </Fragment>
        );
    };
}, 'withCounterAnimationControls');

// Apply counter animation classes to block wrapper
function applyCounterAnimationClass(extraProps: any, blockType: any, attributes: any) {
    const { 
        enableCounter,
        counterDuration,
        counterCustomDuration,
        counterEasing
    } = attributes;
    
    if (enableCounter) {
        // Add the counter animation class
        extraProps.className = extraProps.className 
            ? `${extraProps.className} animated-counter` 
            : 'animated-counter';

        // Add minimal data attributes for the JavaScript animation
        extraProps['data-counter-duration'] = counterDuration === 'custom' 
            ? (counterCustomDuration || 2000) 
            : (counterDuration || 2000);
        extraProps['data-counter-easing'] = counterEasing || 'easeOut';
    }
    
    return extraProps;
}

// Register the filters
addFilter(
    'blocks.registerBlockType',
    'kotlinskidev/counter-animation-attribute',
    addCounterAnimationAttribute
);

addFilter(
    'editor.BlockEdit',
    'kotlinskidev/counter-animation-controls',
    withCounterAnimationControls
);

addFilter(
    'blocks.getSaveContent.extraProps',
    'kotlinskidev/counter-animation-class',
    applyCounterAnimationClass
);
