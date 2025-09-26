import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { 
    InspectorControls, 
    RichText, 
    useBlockProps 
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl, SelectControl, TextareaControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './style.scss';

// Types
interface Attributes {
    content: string;
    useProtection: boolean;
    protectionType: 'email' | 'phone' | 'text';
    tagName: string;
    originalContent?: string;
    isHtmlMode: boolean; // New attribute for HTML mode
}

interface EditProps {
    attributes: Attributes;
    setAttributes: (attributes: Partial<Attributes>) => void;
}

interface SaveProps {
    attributes: Attributes;
}

// Block registration
registerBlockType('kotlinskidev/protected-content', {
    title: __('Protected Content', 'kotlinskidev'),
    description: __('Content that can be protected from bots using obfuscation', 'kotlinskidev'),
    category: 'kotlinskidev',
    icon: 'shield',
    supports: {
        html: false,
        anchor: true,
        className: true,
        color: {
            text: true,
            background: true,
            link: true,
        },
        spacing: {
            margin: true,
            padding: true,
            blockGap: true,
        },
        typography: {
            fontSize: true,
            lineHeight: true,
            __experimentalFontFamily: true,
            __experimentalFontWeight: true,
            __experimentalFontStyle: true,
            __experimentalTextTransform: true,
            __experimentalTextDecoration: true,
            __experimentalLetterSpacing: true,
        },
        border: {
            color: true,
            radius: true,
            style: true,
            width: true,
        },
    },
    attributes: {
        content: {
            type: 'string',
            source: 'html',
            selector: '.protected-content',
            default: '',
        },
        useProtection: {
            type: 'boolean',
            default: false,
        },
        protectionType: {
            type: 'string',
            default: 'email',
        },
        tagName: {
            type: 'string',
            default: 'p',
        },
        originalContent: {
            type: 'string',
            source: 'attribute',
            selector: '.protected-content',
            attribute: 'data-original-content',
            default: '',
        },
        isHtmlMode: {
            type: 'boolean',
            default: false,
        },
    },
    
    // Handle migration from old format to new format
    deprecated: [
        {
            attributes: {
                content: {
                    type: 'string',
                    source: 'html',
                    selector: '.protected-content',
                    default: '',
                },
                useProtection: {
                    type: 'boolean',
                    default: false,
                },
                protectionType: {
                    type: 'string',
                    default: 'email',
                },
                tagName: {
                    type: 'string',
                    default: 'p',
                },
                originalContent: {
                    type: 'string',
                    source: 'attribute',
                    selector: '.protected-content',
                    attribute: 'data-original-content',
                    default: '',
                },
            },
            save: ({ attributes }: SaveProps) => {
                const { content, useProtection, protectionType, tagName, originalContent } = attributes;
                const blockProps = useBlockProps.save();

                if (!useProtection) {
                    return (
                        <RichText.Content
                            {...blockProps}
                            tagName={tagName as any}
                            className="protected-content"
                            value={content}
                        />
                    );
                }

                // Old format: had content in value
                const contentToStore = originalContent || content || '';
                return (
                    <RichText.Content
                        {...blockProps}
                        tagName={tagName as any}
                        className={`protected-content protected-content--${protectionType}`}
                        data-protected="true"
                        data-protection-type={protectionType}
                        data-original-content={contentToStore}
                        value={contentToStore} // Old format had content here
                    />
                );
            },
            migrate: (attributes: any) => {
                // Migrate from base64 encoded originalContent to plain text
                let migratedOriginalContent = attributes.originalContent;
                
                // If originalContent is base64 encoded, decode it
                if (migratedOriginalContent) {
                    try {
                        // Try to decode - if it fails, it's likely already plain text
                        const decoded = atob(migratedOriginalContent);
                        // Simple check: if decoded contains HTML-like content, it's likely valid
                        if (decoded && (decoded.includes('<') || decoded.length > 0)) {
                            migratedOriginalContent = decoded;
                        }
                    } catch (e) {
                        // If decoding fails, keep the original value (likely already plain text)
                    }
                }
                
                return {
                    ...attributes,
                    originalContent: migratedOriginalContent || attributes.content || '',
                };
            },
        }
    ],

    edit: ({ attributes, setAttributes }: EditProps) => {
        const { content, useProtection, protectionType, tagName, originalContent, isHtmlMode } = attributes;
        
        // Use originalContent if available (when loading protected content), otherwise use content
        const displayContent = originalContent || content;
        
        const blockProps = useBlockProps();

        const tagNameOptions = [
            { label: __('Paragraph', 'kotlinskidev'), value: 'p' },
            { label: __('Heading 1', 'kotlinskidev'), value: 'h1' },
            { label: __('Heading 2', 'kotlinskidev'), value: 'h2' },
            { label: __('Heading 3', 'kotlinskidev'), value: 'h3' },
            { label: __('Heading 4', 'kotlinskidev'), value: 'h4' },
            { label: __('Heading 5', 'kotlinskidev'), value: 'h5' },
            { label: __('Heading 6', 'kotlinskidev'), value: 'h6' },
            { label: __('Span', 'kotlinskidev'), value: 'span' },
            { label: __('Div', 'kotlinskidev'), value: 'div' },
        ];

        const protectionTypeOptions = [
            { label: __('Email', 'kotlinskidev'), value: 'email' },
            { label: __('Phone', 'kotlinskidev'), value: 'phone' },
            { label: __('General Text', 'kotlinskidev'), value: 'text' },
        ];

        return (
            <Fragment>
                <InspectorControls>
                    <PanelBody title={__('Protection Settings', 'kotlinskidev')} initialOpen={true}>
                        <ToggleControl
                            label={__('Use Protection', 'kotlinskidev')}
                            help={__('Enable obfuscation to protect content from bots', 'kotlinskidev')}
                            checked={useProtection}
                            onChange={(value) => setAttributes({ useProtection: value })}
                        />
                        
                        {useProtection && (
                            <SelectControl
                                label={__('Protection Type', 'kotlinskidev')}
                                value={protectionType}
                                options={protectionTypeOptions}
                                onChange={(value) => setAttributes({ protectionType: value as 'email' | 'phone' | 'text' })}
                            />
                        )}
                        
                        <ToggleControl
                            label={__('HTML Mode', 'kotlinskidev')}
                            help={__('Enable to preserve HTML structure (links, formatting, etc.)', 'kotlinskidev')}
                            checked={isHtmlMode}
                            onChange={(value) => setAttributes({ isHtmlMode: value })}
                        />
                        
                        <SelectControl
                            label={__('HTML Tag', 'kotlinskidev')}
                            value={tagName}
                            options={tagNameOptions}
                            onChange={(value) => setAttributes({ tagName: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                {useProtection && (
                    <div className="protection-indicator">
                        🛡️ {__('Protected Content', 'kotlinskidev')} ({protectionType})
                    </div>
                )}
                
                {isHtmlMode ? (
                    <div className={useProtection ? `protected-content protected-content--${protectionType}` : 'protected-content'}>
                        <TextareaControl
                            label={__('HTML Content', 'kotlinskidev')}
                            value={displayContent}
                            onChange={(value) => {
                                setAttributes({ 
                                    content: value,
                                    originalContent: value // Store the full HTML content
                                });
                            }}
                            placeholder={__('Enter your HTML content here...', 'kotlinskidev')}
                            rows={6}
                            help={__('You can paste rich HTML content including links, formatting, and attributes.', 'kotlinskidev')}
                        />
                        
                        {displayContent && (
                            <div 
                                className="html-preview"
                                style={{
                                    border: '0.0625rem solid #ddd',
                                    padding: '0.75rem',
                                    marginTop: '0.5rem',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '0.25rem'
                                }}
                            >
                                <strong>{__('Preview:', 'kotlinskidev')}</strong>
                                <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                            </div>
                        )}
                    </div>
                ) : (
                    <RichText
                        {...blockProps}
                        tagName={tagName as any}
                        className={useProtection ? `protected-content protected-content--${protectionType}` : 'protected-content'}
                        value={displayContent}
                        onChange={(value) => {
                            // Ensure we preserve the full HTML content structure
                            setAttributes({ 
                                content: value,
                                originalContent: value // Store the full HTML content including any formatting/links
                            });
                        }}
                        placeholder={__('Enter your content here...', 'kotlinskidev')}
                        allowedFormats={[
                            'core/bold', 
                            'core/italic', 
                            'core/link',
                            'core/strikethrough',
                            'core/underline'
                        ]}
                        multiline={false}
                        preserveWhiteSpace={true}
                    />
                )}
            </Fragment>
        );
    },

    save: ({ attributes }: SaveProps) => {
        const { content, useProtection, protectionType, tagName, originalContent } = attributes;
        
        const blockProps = useBlockProps.save();

        if (!useProtection) {
            // Return normal content without protection
            return (
                <RichText.Content
                    {...blockProps}
                    tagName={tagName as any}
                    className="protected-content"
                    value={content}
                />
            );
        }

        // For protected content, use originalContent if available, otherwise use content
        const contentToStore = originalContent || content || '';
        
        // Return protected content with data attributes - EMPTY VALUE for protection
        return (
            <RichText.Content
                {...blockProps}
                tagName={tagName as any}
                className={`protected-content protected-content--${protectionType}`}
                data-protected="true"
                data-protection-type={protectionType}
                data-original-content={contentToStore}
                value="" // Empty value - content will be populated by JavaScript
            />
        );
    },
});
