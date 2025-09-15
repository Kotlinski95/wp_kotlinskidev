import React from 'react';
import { ToggleControl, TextControl, Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PWASettings {
    push_notifications_enabled: boolean;
    vapid_public_key: string;
    vapid_private_key: string;
}

interface NotificationSettingsProps {
    settings: PWASettings;
    updateSetting: (key: keyof PWASettings, value: any) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, updateSetting }) => {
    const generateVapidKeys = async () => {
        try {
            // This would typically call a backend endpoint to generate VAPID keys
            // For now, we'll show a placeholder
            const response = await fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'wp_pwa_generate_vapid_keys',
                    nonce: (window as any).wpPwaManagerAdmin?.nonce || ''
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    updateSetting('vapid_public_key', data.data.publicKey);
                    updateSetting('vapid_private_key', data.data.privateKey);
                }
            }
        } catch (error) {
            console.error('Failed to generate VAPID keys:', error);
        }
    };

    return (
        <div className="wp-pwa-notifications-settings">
            <h2>{__('Push Notifications', 'wordpress-pwa-manager')}</h2>
            <p>{__('Configure push notifications for your PWA.', 'wordpress-pwa-manager')}</p>

            <div className="wp-pwa-settings-section">
                <ToggleControl
                    label={__('Enable Push Notifications', 'wordpress-pwa-manager')}
                    checked={settings.push_notifications_enabled}
                    onChange={(value) => updateSetting('push_notifications_enabled', value)}
                    help={__('Allow your PWA to send push notifications to users.', 'wordpress-pwa-manager')}
                />

                {settings.push_notifications_enabled && (
                    <div className="wp-pwa-vapid-settings">
                        <h3>{__('VAPID Keys', 'wordpress-pwa-manager')}</h3>
                        <p>{__('VAPID keys are required for push notifications. Generate new keys or enter existing ones.', 'wordpress-pwa-manager')}</p>

                        <div className="wp-pwa-vapid-actions">
                            <Button
                                variant="secondary"
                                onClick={generateVapidKeys}
                                className="wp-pwa-generate-keys"
                            >
                                {__('Generate VAPID Keys', 'wordpress-pwa-manager')}
                            </Button>
                        </div>

                        <TextControl
                            label={__('VAPID Public Key', 'wordpress-pwa-manager')}
                            value={settings.vapid_public_key}
                            onChange={(value) => updateSetting('vapid_public_key', value)}
                            help={__('The public key for VAPID authentication.', 'wordpress-pwa-manager')}
                            className="wp-pwa-vapid-key"
                        />

                        <TextControl
                            label={__('VAPID Private Key', 'wordpress-pwa-manager')}
                            value={settings.vapid_private_key}
                            onChange={(value) => updateSetting('vapid_private_key', value)}
                            help={__('The private key for VAPID authentication. Keep this secure!', 'wordpress-pwa-manager')}
                            type="password"
                            className="wp-pwa-vapid-key"
                        />

                        {settings.vapid_public_key && settings.vapid_private_key && (
                            <Notice status="success" isDismissible={false}>
                                {__('VAPID keys are configured. Push notifications are ready!', 'wordpress-pwa-manager')}
                            </Notice>
                        )}
                    </div>
                )}
            </div>

            <div className="wp-pwa-settings-section">
                <h3>{__('Notification Permissions', 'wordpress-pwa-manager')}</h3>
                <p>{__('Users will be prompted to allow notifications when they first visit your PWA.', 'wordpress-pwa-manager')}</p>
                
                <div className="wp-pwa-permission-info">
                    <h4>{__('How it works:', 'wordpress-pwa-manager')}</h4>
                    <ol>
                        <li>{__('User visits your PWA', 'wordpress-pwa-manager')}</li>
                        <li>{__('Browser asks for notification permission', 'wordpress-pwa-manager')}</li>
                        <li>{__('If allowed, user can receive push notifications', 'wordpress-pwa-manager')}</li>
                        <li>{__('You can send notifications via WordPress admin or API', 'wordpress-pwa-manager')}</li>
                    </ol>
                </div>
            </div>

            <div className="wp-pwa-settings-section">
                <h3>{__('Testing Notifications', 'wordpress-pwa-manager')}</h3>
                <p>{__('Test your push notification setup:', 'wordpress-pwa-manager')}</p>
                
                <Button
                    variant="primary"
                    disabled={!settings.push_notifications_enabled || !settings.vapid_public_key}
                    className="wp-pwa-test-notification"
                >
                    {__('Send Test Notification', 'wordpress-pwa-manager')}
                </Button>
                
                {(!settings.push_notifications_enabled || !settings.vapid_public_key) && (
                    <p className="wp-pwa-test-disabled">
                        {__('Enable push notifications and configure VAPID keys to test.', 'wordpress-pwa-manager')}
                    </p>
                )}
            </div>

            <div className="wp-pwa-notification-tips">
                <h3>{__('Best Practices', 'wordpress-pwa-manager')}</h3>
                <ul>
                    <li>{__('Only send relevant, timely notifications', 'wordpress-pwa-manager')}</li>
                    <li>{__('Respect user preferences and local time zones', 'wordpress-pwa-manager')}</li>
                    <li>{__('Keep notification content concise and actionable', 'wordpress-pwa-manager')}</li>
                    <li>{__('Provide easy unsubscribe options', 'wordpress-pwa-manager')}</li>
                </ul>
            </div>
        </div>
    );
};

export default NotificationSettings;
