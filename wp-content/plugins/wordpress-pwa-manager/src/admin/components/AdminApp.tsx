import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    TabPanel,
    Button,
    Notice,
    Spinner
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

import GeneralSettings from './GeneralSettings';
import AppearanceSettings from './AppearanceSettings';
import InstallPromptSettings from './InstallPromptSettings';
import CacheSettings from './CacheSettings';
import NotificationSettings from './NotificationSettings';
import IconsSettings from './IconsSettings';
import OfflineSettings from './OfflineSettings';

interface PWASettings {
    pwa_enabled: boolean;
    app_name: string;
    app_short_name: string;
    app_description: string;
    theme_color: string;
    background_color: string;
    display: string;
    orientation: string;
    start_url: string;
    scope: string;
    icon_192: string;
    icon_512: string;
    install_prompt_enabled: boolean;
    offline_page_enabled: boolean;
    offline_page_title: string;
    offline_page_message: string;
    offline_page_use_custom_template: boolean;
    offline_page_template: string;
    cache_strategy: string;
    cache_max_entries: number;
    cache_max_age: number;
    push_notifications_enabled: boolean;
    vapid_public_key: string;
    vapid_private_key: string;
    update_prompt_enabled: boolean;
    update_prompt_button_text: string;
}

const AdminApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<PWASettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const tabs = [
        { name: 'general', title: __('General', 'wordpress-pwa-manager') },
        { name: 'appearance', title: __('Appearance', 'wordpress-pwa-manager') },
        { name: 'icons', title: __('Icons', 'wordpress-pwa-manager') },
        { name: 'install', title: __('Install Prompt', 'wordpress-pwa-manager') },
        { name: 'offline', title: __('Offline Page', 'wordpress-pwa-manager') },
        { name: 'cache', title: __('Cache', 'wordpress-pwa-manager') },
        { name: 'notifications', title: __('Notifications', 'wordpress-pwa-manager') },
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await apiFetch<PWASettings>({
                path: '/wp-pwa-manager/v1/settings',
            });
            setSettings(response);
        } catch (error) {
            console.error('Failed to load settings:', error);
            setNotice({
                type: 'error',
                message: __('Failed to load settings', 'wordpress-pwa-manager')
            });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!settings) return;

        setSaving(true);
        try {
            await apiFetch({
                path: '/wp-pwa-manager/v1/settings',
                method: 'POST',
                data: { settings }
            });
            
            setNotice({
                type: 'success',
                message: __('Settings saved successfully!', 'wordpress-pwa-manager')
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
            setNotice({
                type: 'error',
                message: __('Failed to save settings', 'wordpress-pwa-manager')
            });
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: keyof PWASettings, value: any) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [key]: value
        });
    };

    if (loading) {
        return (
            <div className="wp-pwa-admin-loading">
                <Spinner style={{}} />
                <p>{__('Loading settings...', 'wordpress-pwa-manager')}</p>
            </div>
        );
    }

    if (!settings) {
        return (
            <Notice status="error" isDismissible={false}>
                {__('Failed to load PWA Manager settings.', 'wordpress-pwa-manager')}
            </Notice>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings settings={settings} updateSetting={updateSetting} />;
            case 'appearance':
                return <AppearanceSettings settings={settings} updateSetting={updateSetting} />;
            case 'icons':
                return <IconsSettings settings={settings} updateSetting={updateSetting} />;
            case 'install':
                return <InstallPromptSettings settings={settings} updateSetting={updateSetting} />;
            case 'offline':
                return <OfflineSettings settings={settings} updateSetting={updateSetting} />;
            case 'cache':
                return <CacheSettings settings={settings} updateSetting={updateSetting} />;
            case 'notifications':
                return <NotificationSettings settings={settings} updateSetting={updateSetting} />;
            default:
                return null;
        }
    };

    return (
        <div className="wp-pwa-admin-app">
            <div className="wp-pwa-admin-header">
                <h1>{__('PWA Manager Settings', 'wordpress-pwa-manager')}</h1>
                <Button 
                    variant="primary" 
                    onClick={saveSettings} 
                    disabled={saving}
                    className="wp-pwa-save-button"
                >
                    {saving ? __('Saving...', 'wordpress-pwa-manager') : __('Save Settings', 'wordpress-pwa-manager')}
                </Button>
            </div>

            {notice && (
                <Notice 
                    status={notice.type} 
                    onRemove={() => setNotice(null)}
                    className="wp-pwa-admin-notice"
                >
                    {notice.message}
                </Notice>
            )}

            <div className="wp-pwa-admin-content">
                <div className="wp-pwa-admin-tabs">
                    <nav className="wp-pwa-tab-nav">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                className={`wp-pwa-tab-button ${activeTab === tab.name ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.name)}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="wp-pwa-admin-tab-content">
                    <Card>
                        <CardBody>
                            {renderTabContent()}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminApp;
