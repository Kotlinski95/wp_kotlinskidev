import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment, createElement } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// Define which blocks should have the justify control
const supportedBlocks = ['core/paragraph', 'core/heading'];

// Custom justify icon component
const JustifyIcon = () =>
    createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none'
    },
        createElement('path', {
            d: 'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z',
            fill: 'currentColor'
        })
    );

// Higher order component to add justify controls
const withTextJustifyControl = createHigherOrderComponent(
    (BlockEdit) => {
        return (props) => {
            const { attributes, setAttributes, name } = props;
            
            // Only add to supported blocks
            if (!supportedBlocks.includes(name)) {
                return createElement(BlockEdit, props);
            }
            
            // Use correct attribute name based on block type
            const alignmentAttr = name === 'core/paragraph' ? 'align' : 'textAlign';
            const currentAlignment = attributes[alignmentAttr];

            const handleAlignmentChange = (alignment) => {
                setAttributes({
                    [alignmentAttr]: currentAlignment === alignment ? undefined : alignment
                });
            };
            
            return createElement(Fragment, null,
                // Add justify button to block toolbar
                createElement(BlockControls, { group: 'block' },
                    createElement(ToolbarGroup, null,
                        createElement(ToolbarButton, {
                            icon: createElement(JustifyIcon),
                            title: __('Justify text', 'text-justify-controls'),
                            onClick: () => handleAlignmentChange('justify'),
                            isActive: currentAlignment === 'justify'
                        })
                    )
                ),
                
                createElement(BlockEdit, props)
            );
        };
    },
    'withTextJustifyControl'
);

// Add justify class in editor
const addJustifyClassInEditor = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { attributes, name } = props;
            
            if (!supportedBlocks.includes(name)) {
                return createElement(BlockListBlock, props);
            }
            
            // Use correct attribute name based on block type
            const alignmentAttr = name === 'core/paragraph' ? 'align' : 'textAlign';
            const currentAlignment = attributes[alignmentAttr];
            
            if (currentAlignment === 'justify') {
                const newProps = {
                    ...props,
                    className: `${props.className || ''} has-text-align-justify`.trim()
                };
                return createElement(BlockListBlock, newProps);
            }
            
            return createElement(BlockListBlock, props);
        };
    },
    'addJustifyClassInEditor'
);

// Apply the filters
addFilter(
    'editor.BlockEdit',
    'text-justify-controls/with-text-justify-control',
    withTextJustifyControl
);

addFilter(
    'editor.BlockListBlock',
    'text-justify-controls/add-justify-class-in-editor',
    addJustifyClassInEditor
);
