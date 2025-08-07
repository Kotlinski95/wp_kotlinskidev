/**
 * Lazy Loading Extension
 * Adds lazy loading controls to the core/cover and core/image blocks
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import React, { Fragment } from 'react';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';

// Types
interface CoverAttributes {
    kotlinskidevSkipLazy?: boolean;
    [key: string]: any; // Allow other cover block attributes
}

interface BlockEditProps {
    attributes: CoverAttributes;
    setAttributes: (attributes: Partial<CoverAttributes>) => void;
    name: string;
    [key: string]: any; // Allow other props
}

/**
 * Add custom attribute to core/cover and core/image blocks
 */
function addCoverLazyLoadingAttribute(settings: any, name: string) {
    if (name !== 'core/cover' && name !=='core/image') {
        return settings;
    }

    return {
        ...settings,
        attributes: {
            ...settings.attributes,
            kotlinskidevSkipLazy: {
                type: 'boolean',
                default: false,
            },
        },
    };
}

/**
 * Add controls to the block inspector
 */
const withCoverLazyLoadingControls = createHigherOrderComponent(
    (BlockEdit: React.ComponentType<any>) => {
        return (props: BlockEditProps) => {
            const { attributes, setAttributes, name } = props;
            
            if (name !== 'core/cover' && name !=='core/image') {
                return <BlockEdit {...props} />;
            }

            const { kotlinskidevSkipLazy = false } = attributes;

            return (
                <Fragment>
                    <BlockEdit {...props} />
                    <InspectorControls>
                        <PanelBody
                            title={__('Lazy Loading Settings', 'kotlinskidev')}
                            initialOpen={false}
                        >
                            <ToggleControl
                                label={__('Skip Lazy Loading', 'kotlinskidev')}
                                help={kotlinskidevSkipLazy ? 
                                    __('This cover image will not be lazy loaded.', 'kotlinskidev') : 
                                    __('This cover image will use default lazy loading.', 'kotlinskidev')
                                }
                                checked={kotlinskidevSkipLazy}
                                onChange={(value: boolean) => {
                                    setAttributes({ kotlinskidevSkipLazy: value });
                                }}
                            />
                        </PanelBody>
                    </InspectorControls>
                </Fragment>
            );
        };
    },
    'withCoverLazyLoadingControls'
);

// Register the filters
addFilter(
    'blocks.registerBlockType',
    'kotlinskidev/cover-lazy-loading-attribute',
    addCoverLazyLoadingAttribute
);

addFilter(
    'editor.BlockEdit',
    'kotlinskidev/cover-lazy-loading-controls',
    withCoverLazyLoadingControls
);
