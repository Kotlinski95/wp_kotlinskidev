import React from 'react';
import { SelectControl, RangeControl, ToggleControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PWASettings {
    cache_strategy: string;
    cache_max_entries: number;
    cache_max_age: number;
}

interface CacheSettingsProps {
    settings: PWASettings;
    updateSetting: (key: keyof PWASettings, value: any) => void;
}

const CacheSettings: React.FC<CacheSettingsProps> = ({ settings, updateSetting }) => {
    const cacheStrategies = [
        { label: __('Cache First', 'wordpress-pwa-manager'), value: 'cache_first' },
        { label: __('Network First', 'wordpress-pwa-manager'), value: 'network_first' },
        { label: __('Stale While Revalidate', 'wordpress-pwa-manager'), value: 'stale_while_revalidate' },
    ];

    return (
        <div className="wp-pwa-cache-settings">
            <h2>{__('Cache Settings', 'wordpress-pwa-manager')}</h2>
            <p>{__('Configure how your PWA handles caching and offline functionality.', 'wordpress-pwa-manager')}</p>

            <div className="wp-pwa-settings-section">
                <h3>{__('Cache Strategy', 'wordpress-pwa-manager')}</h3>
                
                <SelectControl
                    label={__('Caching Strategy', 'wordpress-pwa-manager')}
                    value={settings.cache_strategy}
                    options={cacheStrategies}
                    onChange={(value) => updateSetting('cache_strategy', value)}
                    help={__('Choose how resources are cached and served.', 'wordpress-pwa-manager')}
                />

                <div className="wp-pwa-cache-strategy-info">
                    {settings.cache_strategy === 'cache_first' && (
                        <p><strong>{__('Cache First:', 'wordpress-pwa-manager')}</strong> {__('Serves cached content first, falls back to network. Best for static assets.', 'wordpress-pwa-manager')}</p>
                    )}
                    {settings.cache_strategy === 'network_first' && (
                        <p><strong>{__('Network First:', 'wordpress-pwa-manager')}</strong> {__('Tries network first, falls back to cache. Best for dynamic content.', 'wordpress-pwa-manager')}</p>
                    )}
                    {settings.cache_strategy === 'stale_while_revalidate' && (
                        <p><strong>{__('Stale While Revalidate:', 'wordpress-pwa-manager')}</strong> {__('Serves cached content immediately, updates in background. Good balance for most content.', 'wordpress-pwa-manager')}</p>
                    )}
                </div>
            </div>

            <div className="wp-pwa-settings-section">
                <h3>{__('Cache Limits', 'wordpress-pwa-manager')}</h3>
                
                <RangeControl
                    label={__('Maximum Cache Entries', 'wordpress-pwa-manager')}
                    value={Number(settings.cache_max_entries) || 50}
                    onChange={(value) => updateSetting('cache_max_entries', value)}
                    min={10}
                    max={500}
                    step={10}
                    help={__('Maximum number of items to store in cache.', 'wordpress-pwa-manager')}
                />

                <RangeControl
                    label={__('Cache Max Age (days)', 'wordpress-pwa-manager')}
                    value={Number(settings.cache_max_age) || 30}
                    onChange={(value) => updateSetting('cache_max_age', value)}
                    min={1}
                    max={365}
                    step={1}
                    help={__('How long to keep items in cache before refreshing.', 'wordpress-pwa-manager')}
                />
            </div>

            <div className="wp-pwa-cache-info">
                <h3>{__('Cache Information', 'wordpress-pwa-manager')}</h3>
                <div className="wp-pwa-info-grid">
                    <div className="wp-pwa-info-item">
                        <span className="wp-pwa-info-label">{__('Current Strategy:', 'wordpress-pwa-manager')}</span>
                        <span className="wp-pwa-info-value">{cacheStrategies.find(s => s.value === settings.cache_strategy)?.label}</span>
                    </div>
                    <div className="wp-pwa-info-item">
                        <span className="wp-pwa-info-label">{__('Max Entries:', 'wordpress-pwa-manager')}</span>
                        <span className="wp-pwa-info-value">{settings.cache_max_entries}</span>
                    </div>
                    <div className="wp-pwa-info-item">
                        <span className="wp-pwa-info-label">{__('Cache Duration:', 'wordpress-pwa-manager')}</span>
                        <span className="wp-pwa-info-value">{settings.cache_max_age} {__('days', 'wordpress-pwa-manager')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CacheSettings;
