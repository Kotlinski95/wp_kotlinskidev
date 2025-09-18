import React from 'react';
import { ColorPicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PWASettings {
    theme_color: string;
    background_color: string;
}

interface AppearanceSettingsProps {
    settings: PWASettings;
    updateSetting: (key: keyof PWASettings, value: any) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ settings, updateSetting }) => {
    return (
        <div className="wp-pwa-appearance-settings">
            <h2>{__('Appearance Settings', 'wordpress-pwa-manager')}</h2>
            <p>{__('Customize the visual appearance of your PWA.', 'wordpress-pwa-manager')}</p>

            <div className="wp-pwa-color-section">
                <div className="wp-pwa-color-picker">
                    <h3>{__('Theme Color', 'wordpress-pwa-manager')}</h3>
                    <p>{__('The color of the browser UI elements.', 'wordpress-pwa-manager')}</p>
                    <ColorPicker
                        color={settings.theme_color}
                        onChange={(color) => updateSetting('theme_color', color)}
                        enableAlpha={false}
                    />
                    <div className="wp-pwa-color-preview" style={{ backgroundColor: settings.theme_color }}>
                        <span>{settings.theme_color}</span>
                    </div>
                </div>

                <div className="wp-pwa-color-picker">
                    <h3>{__('Background Color', 'wordpress-pwa-manager')}</h3>
                    <p>{__('The background color shown while the app loads.', 'wordpress-pwa-manager')}</p>
                    <ColorPicker
                        color={settings.background_color}
                        onChange={(color) => updateSetting('background_color', color)}
                        enableAlpha={false}
                    />
                    <div className="wp-pwa-color-preview" style={{ backgroundColor: settings.background_color }}>
                        <span>{settings.background_color}</span>
                    </div>
                </div>
            </div>

            <div className="wp-pwa-preview-section">
                <h3>{__('Preview', 'wordpress-pwa-manager')}</h3>
                <div className="wp-pwa-mobile-preview">
                    <div 
                        className="wp-pwa-mobile-frame"
                        style={{ 
                            backgroundColor: settings.background_color,
                            borderColor: settings.theme_color 
                        }}
                    >
                        <div 
                            className="wp-pwa-status-bar"
                            style={{ backgroundColor: settings.theme_color }}
                        >
                            <span className="wp-pwa-time">9:41</span>
                            <span className="wp-pwa-battery">100%</span>
                        </div>
                        <div className="wp-pwa-app-content">
                            <h4>Your App</h4>
                            <p>This is how your PWA will look</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
