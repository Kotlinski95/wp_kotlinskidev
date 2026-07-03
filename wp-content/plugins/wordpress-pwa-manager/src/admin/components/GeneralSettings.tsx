import React from 'react';
import { TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PWASettings {
    pwa_enabled: boolean;
    app_name: string;
    app_short_name: string;
    app_description: string;
    start_url: string;
    scope: string;
    display: string;
    orientation: string;
}

interface GeneralSettingsProps {
    settings: PWASettings;
    updateSetting: (key: keyof PWASettings, value: any) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, updateSetting }) => {
    return (
        <div className="wp-pwa-general-settings">
            <h2>{__('General Settings', 'wordpress-pwa-manager')}</h2>
            <p>{__('Configure basic PWA application settings.', 'wordpress-pwa-manager')}</p>

            <div className="wp-pwa-settings-section wp-pwa-enable-section">
                <ToggleControl
                    label={__('Enable PWA Features', 'wordpress-pwa-manager')}
                    checked={settings.pwa_enabled}
                    onChange={(value) => updateSetting('pwa_enabled', value)}
                    help={__('Enable or disable all PWA functionality. When disabled, your site will behave as a regular website.', 'wordpress-pwa-manager')}
                    className="wp-pwa-master-toggle"
                />
                
                {!settings.pwa_enabled && (
                    <div className="wp-pwa-disabled-notice">
                        <p><strong>{__('PWA features are currently disabled.', 'wordpress-pwa-manager')}</strong></p>
                        <p>{__('Enable PWA features above to configure your Progressive Web App settings.', 'wordpress-pwa-manager')}</p>
                    </div>
                )}
            </div>

            {settings.pwa_enabled && (
                <>
                    <TextControl
                        label={__('App Name', 'wordpress-pwa-manager')}
                        value={settings.app_name}
                        onChange={(value) => updateSetting('app_name', value)}
                        help={__('The full name of your PWA as it will appear to users.', 'wordpress-pwa-manager')}
                    />

            <TextControl
                label={__('App Short Name', 'wordpress-pwa-manager')}
                value={settings.app_short_name}
                onChange={(value) => updateSetting('app_short_name', value)}
                help={__('A shorter name for your PWA (12 characters or less).', 'wordpress-pwa-manager')}
            />

            <TextareaControl
                label={__('App Description', 'wordpress-pwa-manager')}
                value={settings.app_description}
                onChange={(value) => updateSetting('app_description', value)}
                help={__('A brief description of your PWA.', 'wordpress-pwa-manager')}
                rows={3}
            />

            <TextControl
                label={__('Start URL', 'wordpress-pwa-manager')}
                value={settings.start_url}
                onChange={(value) => updateSetting('start_url', value)}
                help={__('The URL that loads when users launch your PWA.', 'wordpress-pwa-manager')}
            />

            <div className="wp-pwa-form-row">
                <div className="wp-pwa-form-column">
                    <label>{__('Display Mode', 'wordpress-pwa-manager')}</label>
                    <select
                        value={settings.display}
                        onChange={(e) => updateSetting('display', e.target.value)}
                        className="wp-pwa-select"
                    >
                        <option value="standalone">{__('Standalone', 'wordpress-pwa-manager')}</option>
                        <option value="fullscreen">{__('Fullscreen', 'wordpress-pwa-manager')}</option>
                        <option value="minimal-ui">{__('Minimal UI', 'wordpress-pwa-manager')}</option>
                        <option value="browser">{__('Browser', 'wordpress-pwa-manager')}</option>
                    </select>
                </div>

                <div className="wp-pwa-form-column">
                    <label>{__('Orientation', 'wordpress-pwa-manager')}</label>
                    <select
                        value={settings.orientation}
                        onChange={(e) => updateSetting('orientation', e.target.value)}
                        className="wp-pwa-select"
                    >
                        <option value="any">{__('Any', 'wordpress-pwa-manager')}</option>
                        <option value="portrait">{__('Portrait', 'wordpress-pwa-manager')}</option>
                        <option value="landscape">{__('Landscape', 'wordpress-pwa-manager')}</option>
                    </select>
                </div>
            </div>
                </>
            )}
        </div>
    );
};

export default GeneralSettings;
