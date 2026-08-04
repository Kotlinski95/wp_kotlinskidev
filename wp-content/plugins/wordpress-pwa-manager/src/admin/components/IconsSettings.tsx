import React, { useState } from 'react';
import { Button, Notice, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

interface PWASettings {
    icon_192: string;
    icon_512: string;
}

interface IconsSettingsProps {
    settings: PWASettings;
    updateSetting: (key: keyof PWASettings, value: any) => void;
}

const IconsSettings: React.FC<IconsSettingsProps> = ({ settings, updateSetting }) => {
    const [uploading, setUploading] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>, size: '192' | '512') => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError(__('Please upload an image file.', 'wordpress-pwa-manager'));
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setUploadError(__('File size must be less than 2MB.', 'wordpress-pwa-manager'));
            return;
        }

        setUploading(size);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('icon', file);

            const response = await apiFetch({
                path: '/wp-pwa-manager/v1/upload-icon',
                method: 'POST',
                body: formData,
            }) as { success: boolean; url: string };

            if (response.success) {
                updateSetting(`icon_${size}` as keyof PWASettings, response.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError(__('Failed to upload icon. Please try again.', 'wordpress-pwa-manager'));
        } finally {
            setUploading(null);
        }
    };

    const removeIcon = (size: '192' | '512') => {
        updateSetting(`icon_${size}` as keyof PWASettings, '');
    };

    return (
        <div className="wp-pwa-icons-settings">
            <h2>{__('PWA Icons', 'wordpress-pwa-manager')}</h2>
            <p>{__('Upload icons for your PWA. Icons should be square and in PNG format.', 'wordpress-pwa-manager')}</p>

            {uploadError && (
                <Notice status="error" onRemove={() => setUploadError(null)}>
                    {uploadError}
                </Notice>
            )}

            <div className="wp-pwa-icons-grid">
                {/* 192x192 Icon */}
                <div className="wp-pwa-icon-section">
                    <h3>{__('Icon 192x192', 'wordpress-pwa-manager')}</h3>
                    <p>{__('Used for home screen and app launcher', 'wordpress-pwa-manager')}</p>
                    
                    <div className="wp-pwa-icon-upload">
                        {settings.icon_192 ? (
                            <div className="wp-pwa-icon-preview">
                                <img 
                                    src={settings.icon_192} 
                                    alt="192x192 icon" 
                                    className="wp-pwa-icon-image"
                                />
                                <div className="wp-pwa-icon-actions">
                                    <Button
                                        variant="secondary"
                                        onClick={() => removeIcon('192')}
                                        className="wp-pwa-remove-icon"
                                    >
                                        {__('Remove', 'wordpress-pwa-manager')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="wp-pwa-icon-placeholder">
                                <div className="wp-pwa-icon-placeholder-content">
                                    <span>192×192</span>
                                </div>
                            </div>
                        )}

                        <div className="wp-pwa-upload-controls">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleIconUpload(e, '192')}
                                disabled={uploading === '192'}
                                className="wp-pwa-file-input"
                                id="icon-192-upload"
                            />
                            <label htmlFor="icon-192-upload" className="wp-pwa-upload-button">
                                {uploading === '192' ? (
                                    <>
                                        <Spinner style={{}} />
                                        {__('Uploading...', 'wordpress-pwa-manager')}
                                    </>
                                ) : (
                                    __('Upload 192x192 Icon', 'wordpress-pwa-manager')
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* 512x512 Icon */}
                <div className="wp-pwa-icon-section">
                    <h3>{__('Icon 512x512', 'wordpress-pwa-manager')}</h3>
                    <p>{__('Used for splash screen and high-resolution displays', 'wordpress-pwa-manager')}</p>
                    
                    <div className="wp-pwa-icon-upload">
                        {settings.icon_512 ? (
                            <div className="wp-pwa-icon-preview">
                                <img 
                                    src={settings.icon_512} 
                                    alt="512x512 icon" 
                                    className="wp-pwa-icon-image"
                                />
                                <div className="wp-pwa-icon-actions">
                                    <Button
                                        variant="secondary"
                                        onClick={() => removeIcon('512')}
                                        className="wp-pwa-remove-icon"
                                    >
                                        {__('Remove', 'wordpress-pwa-manager')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="wp-pwa-icon-placeholder">
                                <div className="wp-pwa-icon-placeholder-content">
                                    <span>512×512</span>
                                </div>
                            </div>
                        )}

                        <div className="wp-pwa-upload-controls">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleIconUpload(e, '512')}
                                disabled={uploading === '512'}
                                className="wp-pwa-file-input"
                                id="icon-512-upload"
                            />
                            <label htmlFor="icon-512-upload" className="wp-pwa-upload-button">
                                {uploading === '512' ? (
                                    <>
                                        <Spinner style={{}} />
                                        {__('Uploading...', 'wordpress-pwa-manager')}
                                    </>
                                ) : (
                                    __('Upload 512x512 Icon', 'wordpress-pwa-manager')
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wp-pwa-icon-tips">
                <h3>{__('Icon Tips', 'wordpress-pwa-manager')}</h3>
                <ul>
                    <li>{__('Use PNG format for best results', 'wordpress-pwa-manager')}</li>
                    <li>{__('Icons should be square (same width and height)', 'wordpress-pwa-manager')}</li>
                    <li>{__('Use high contrast colors for better visibility', 'wordpress-pwa-manager')}</li>
                    <li>{__('Avoid text in icons as it may be hard to read at small sizes', 'wordpress-pwa-manager')}</li>
                </ul>
            </div>
        </div>
    );
};

export default IconsSettings;
