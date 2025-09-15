import React from 'react';
import { ToggleControl, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PWASettings {
    install_prompt_enabled: boolean;
    update_prompt_enabled: boolean;
}

interface InstallPromptSettingsProps {
    settings: PWASettings;
    updateSetting: (key: keyof PWASettings, value: any) => void;
}

const InstallPromptSettings: React.FC<InstallPromptSettingsProps> = ({ settings, updateSetting }) => {
    return (
        <div className="wp-pwa-install-settings">
            <h2>{__('Install Prompt Settings', 'wordpress-pwa-manager')}</h2>
            <p>{__('Configure the app installation prompts and update notifications.', 'wordpress-pwa-manager')}</p>

            <div className="wp-pwa-settings-section">
                <h3>{__('Install Prompt', 'wordpress-pwa-manager')}</h3>
                
                <ToggleControl
                    label={__('Enable Install Prompt', 'wordpress-pwa-manager')}
                    checked={settings.install_prompt_enabled}
                    onChange={(value) => updateSetting('install_prompt_enabled', value)}
                    help={__('Show a prompt to users encouraging them to install your PWA. Text content will be automatically translated based on your site language.', 'wordpress-pwa-manager')}
                />
            </div>

            <div className="wp-pwa-settings-section">
                <h3>{__('Update Prompt', 'wordpress-pwa-manager')}</h3>
                
                <ToggleControl
                    label={__('Enable Update Prompt', 'wordpress-pwa-manager')}
                    checked={settings.update_prompt_enabled}
                    onChange={(value) => updateSetting('update_prompt_enabled', value)}
                    help={__('Show a prompt when app updates are available. Text content will be automatically translated based on your site language.', 'wordpress-pwa-manager')}
                />
            </div>
        </div>
    );
};

export default InstallPromptSettings;
