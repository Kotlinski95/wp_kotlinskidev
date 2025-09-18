import React, { useState } from 'react';
import { 
    TextControl, 
    TextareaControl, 
    ToggleControl, 
    Button, 
    Modal,
    Notice,
    RadioControl
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface OfflineSettings {
    offline_page_enabled: boolean;
    offline_page_title: string;
    offline_page_message: string;
    offline_page_use_custom_template: boolean;
    offline_page_template: string;
    offline_page_template_source: 'plugin' | 'theme';
}

interface OfflineSettingsProps {
    settings: OfflineSettings;
    updateSetting: (key: keyof OfflineSettings, value: any) => void;
}

const OfflineSettings: React.FC<OfflineSettingsProps> = ({ settings, updateSetting }) => {
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const loadDefaultTemplate = async () => {
        if (!confirm(__('This will replace your current template. Are you sure?', 'wordpress-pwa-manager'))) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/wp-json/wp-pwa-manager/v1/offline-template/default', {
                headers: {
                    'X-WP-Nonce': ((window as any).wpApiSettings?.nonce) || wp.apiRequest?.nonce || '',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                updateSetting('offline_page_template', data.template);
                setNotice({ type: 'success', message: __('Default template loaded successfully!', 'wordpress-pwa-manager') });
            } else {
                throw new Error(data.message || 'Failed to load default template');
            }
        } catch (error) {
            console.error('Error loading default template:', error);
            setNotice({ type: 'error', message: __('Failed to load default template. Please try again.', 'wordpress-pwa-manager') });
        } finally {
            setIsLoading(false);
        }
    };

    const previewTemplate = async () => {
        // For theme file source, we don't need a template in settings
        if (settings.offline_page_template_source === 'theme') {
            // Preview theme file
            setIsLoading(true);
            try {
                const response = await fetch('/wp-json/wp-pwa-manager/v1/offline-template/preview', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': ((window as any).wpApiSettings?.nonce) || wp.apiRequest?.nonce || ''
                    },
                    body: JSON.stringify({
                        template_source: 'theme'
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    setPreviewContent(data.processed_template);
                    setIsPreviewModalOpen(true);
                } else {
                    throw new Error(data.message || 'Failed to preview theme template');
                }
            } catch (error) {
                console.error('Error previewing theme template:', error);
                setNotice({ type: 'error', message: __('Failed to preview theme template. Please check if the offline.html file exists in your theme directory.', 'wordpress-pwa-manager') });
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // For plugin template source
        if (!settings.offline_page_template.trim()) {
            setNotice({ type: 'error', message: __('Please enter a template to preview.', 'wordpress-pwa-manager') });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/wp-json/wp-pwa-manager/v1/offline-template/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': ((window as any).wpApiSettings?.nonce) || wp.apiRequest?.nonce || ''
                },
                body: JSON.stringify({
                    template: settings.offline_page_template
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setPreviewContent(data.processed_template);
                setIsPreviewModalOpen(true);
            } else {
                throw new Error(data.message || 'Failed to preview template');
            }
        } catch (error) {
            console.error('Error previewing template:', error);
            setNotice({ type: 'error', message: __('Failed to preview template. Please check your template syntax.', 'wordpress-pwa-manager') });
        } finally {
            setIsLoading(false);
        }
    };

    const dismissNotice = () => {
        setNotice(null);
    };

    const availablePlaceholders = [
        '{{OFFLINE_TITLE}}',
        '{{OFFLINE_MESSAGE}}',
        '{{APP_NAME}}',
        '{{THEME_COLOR}}',
        '{{BACKGROUND_COLOR}}',
        '{{HOME_URL}}',
        '{{SITE_NAME}}',
        '{{SITE_DESCRIPTION}}'
    ];

    return (
        <div className="wp-pwa-offline-settings">
            <h2>{__('Offline Page Settings', 'wordpress-pwa-manager')}</h2>
            <p>{__('Configure how your PWA behaves when users are offline.', 'wordpress-pwa-manager')}</p>

            {notice && (
                <Notice 
                    status={notice.type} 
                    onRemove={dismissNotice}
                    className="wp-pwa-notice"
                >
                    {notice.message}
                </Notice>
            )}

            <div className="wp-pwa-settings-section">
                <ToggleControl
                    label={__('Enable Offline Page', 'wordpress-pwa-manager')}
                    checked={settings.offline_page_enabled}
                    onChange={(value) => updateSetting('offline_page_enabled', value)}
                    help={__('Show a custom offline page when users lose internet connection.', 'wordpress-pwa-manager')}
                />
            </div>

            {settings.offline_page_enabled && (
                <>
                    <div className="wp-pwa-settings-section">
                        <TextControl
                            label={__('Offline Page Title', 'wordpress-pwa-manager')}
                            value={settings.offline_page_title}
                            onChange={(value) => updateSetting('offline_page_title', value)}
                            help={__('The title shown on the offline page.', 'wordpress-pwa-manager')}
                        />
                    </div>

                    <div className="wp-pwa-settings-section">
                        <TextareaControl
                            label={__('Offline Page Message', 'wordpress-pwa-manager')}
                            value={settings.offline_page_message}
                            onChange={(value) => updateSetting('offline_page_message', value)}
                            help={__('The message shown to users when they are offline.', 'wordpress-pwa-manager')}
                            rows={3}
                        />
                    </div>

                    <div className="wp-pwa-settings-section">
                        <ToggleControl
                            label={__('Use Custom HTML Template', 'wordpress-pwa-manager')}
                            checked={settings.offline_page_use_custom_template}
                            onChange={(value) => updateSetting('offline_page_use_custom_template', value)}
                            help={__('Enable to use a custom HTML template for the offline page instead of the default design.', 'wordpress-pwa-manager')}
                        />
                    </div>

                    {settings.offline_page_use_custom_template && (
                        <div className="wp-pwa-settings-section">
                            <RadioControl
                                label={__('Template Source', 'wordpress-pwa-manager')}
                                selected={settings.offline_page_template_source}
                                options={[
                                    {
                                        label: __('Plugin Settings (editable below)', 'wordpress-pwa-manager'),
                                        value: 'plugin'
                                    },
                                    {
                                        label: __('Theme File (offline.html)', 'wordpress-pwa-manager'),
                                        value: 'theme'
                                    }
                                ]}
                                onChange={(value) => updateSetting('offline_page_template_source', value as 'plugin' | 'theme')}
                                help={__('Choose whether to use the custom template from plugin settings or a local offline.html file from your active theme directory.', 'wordpress-pwa-manager')}
                            />
                        </div>
                    )}

                    {settings.offline_page_use_custom_template && settings.offline_page_template_source === 'plugin' && (
                        <div className="wp-pwa-settings-section wp-pwa-template-section">
                            <label className="components-base-control__label">
                                {__('Custom Offline Template', 'wordpress-pwa-manager')}
                            </label>
                            <p className="wp-pwa-help-text">
                                {__('Enter your custom HTML template. You can use the following placeholders:', 'wordpress-pwa-manager')}
                            </p>
                            <div className="wp-pwa-placeholders">
                                {availablePlaceholders.map(placeholder => (
                                    <code key={placeholder} className="wp-pwa-placeholder">
                                        {placeholder}
                                    </code>
                                ))}
                            </div>
                            
                            <textarea
                                className="wp-pwa-template-editor"
                                value={settings.offline_page_template}
                                onChange={(e) => updateSetting('offline_page_template', e.target.value)}
                                rows={25}
                                cols={100}
                                placeholder={__('Enter your custom HTML template here...', 'wordpress-pwa-manager')}
                            />
                            
                            <div className="wp-pwa-template-actions">
                                <Button
                                    variant="secondary"
                                    onClick={loadDefaultTemplate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? __('Loading...', 'wordpress-pwa-manager') : __('Load Default Template', 'wordpress-pwa-manager')}
                                </Button>
                                
                                <Button
                                    variant="secondary"
                                    onClick={previewTemplate}
                                    disabled={isLoading || (settings.offline_page_template_source === 'plugin' && !settings.offline_page_template.trim())}
                                >
                                    {isLoading ? __('Previewing...', 'wordpress-pwa-manager') : __('Preview Template', 'wordpress-pwa-manager')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {settings.offline_page_use_custom_template && settings.offline_page_template_source === 'theme' && (
                        <div className="wp-pwa-settings-section">
                            <div className="wp-pwa-theme-file-info">
                                <h4>{__('Using Theme File', 'wordpress-pwa-manager')}</h4>
                                <p>
                                    {__('The offline page will use the offline.html file from your active theme directory. You can edit this file in your code editor and version control it with your theme.', 'wordpress-pwa-manager')}
                                </p>
                                <p>
                                    <strong>{__('File location:', 'wordpress-pwa-manager')}</strong> <code>wp-content/themes/[active-theme]/offline.html</code>
                                </p>
                                <p>
                                    {__('The same placeholders are available in your theme file:', 'wordpress-pwa-manager')}
                                </p>
                                <div className="wp-pwa-placeholders">
                                    {availablePlaceholders.map(placeholder => (
                                        <code key={placeholder} className="wp-pwa-placeholder">
                                            {placeholder}
                                        </code>
                                    ))}
                                </div>
                                
                                <div className="wp-pwa-template-actions">
                                    <Button
                                        variant="secondary"
                                        onClick={previewTemplate}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? __('Previewing...', 'wordpress-pwa-manager') : __('Preview Theme Template', 'wordpress-pwa-manager')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {isPreviewModalOpen && (
                <Modal
                    title={__('Offline Page Preview', 'wordpress-pwa-manager')}
                    onRequestClose={() => setIsPreviewModalOpen(false)}
                    className="wp-pwa-preview-modal"
                    style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                >
                    <div className="wp-pwa-preview-container">
                        <iframe
                            srcDoc={previewContent}
                            style={{
                                width: '100%',
                                height: '70vh',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                            title={__('Offline Page Preview', 'wordpress-pwa-manager')}
                        />
                    </div>
                    <div className="wp-pwa-modal-actions">
                        <Button
                            variant="primary"
                            onClick={() => setIsPreviewModalOpen(false)}
                        >
                            {__('Close Preview', 'wordpress-pwa-manager')}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default OfflineSettings;
