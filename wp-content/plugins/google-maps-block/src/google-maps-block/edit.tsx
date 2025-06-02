import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, RangeControl } from '@wordpress/components';
import React from 'react';
import './editor.scss';

export interface GoogleMapsBlockProps {
    apiKey: string;
    address: string;
    lat: string;
    lng: string;
    zoom: number;
    width: string;
    height: string;
}

const GoogleMapsBlockEdit = ({ attributes, setAttributes }: any) => {
    const blockProps = useBlockProps();
    const { apiKey = '', address = '', lat = '', lng = '', zoom = 14, width = '100%', height = '400px' } = attributes;

    // Placeholder for map preview
    const mapUrl = apiKey
        ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom}`
        : '';

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Map Settings', 'google-maps-block')}>
                    <TextControl
                        label={__('Google Maps API Key', 'google-maps-block')}
                        value={apiKey}
                        onChange={(value) => setAttributes({ apiKey: value })}
                        help={__('Get your API key from https://console.cloud.google.com/apis/credentials', 'google-maps-block')}
                    />
                    <TextControl
                        label={__('Address', 'google-maps-block')}
                        value={address}
                        onChange={(value) => setAttributes({ address: value })}
                        help={__('Enter the address or leave blank to use coordinates.', 'google-maps-block')}
                    />
                    <TextControl
                        label={__('Latitude', 'google-maps-block')}
                        value={lat}
                        onChange={(value) => setAttributes({ lat: value })}
                    />
                    <TextControl
                        label={__('Longitude', 'google-maps-block')}
                        value={lng}
                        onChange={(value) => setAttributes({ lng: value })}
                    />
                    <RangeControl
                        label={__('Zoom Level', 'google-maps-block')}
                        value={zoom}
                        onChange={(value) => setAttributes({ zoom: value })}
                        min={1}
                        max={21}
                    />
                    <TextControl
                        label={__('Map Width', 'google-maps-block')}
                        value={width}
                        onChange={(value) => setAttributes({ width: value })}
                        help={__('Any valid CSS width value, e.g. 100%, 600px', 'google-maps-block')}
                    />
                    <TextControl
                        label={__('Map Height', 'google-maps-block')}
                        value={height}
                        onChange={(value) => setAttributes({ height: value })}
                        help={__('Any valid CSS height value, e.g. 400px', 'google-maps-block')}
                    />
                </PanelBody>
            </InspectorControls>
            {apiKey && (address || (lat && lng)) ? (
                <iframe
                    title="Google Map Preview"
                    width={width}
                    height={height}
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={
                        address
                            ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom}`
                            : `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}`
                    }
                />
            ) : (
                <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f3f3', color: '#888', flexDirection: 'column' }}>
                    <img
                        src="https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png"
                        alt="Google Maps Placeholder"
                        style={{ width: 64, height: 64, opacity: 0.5, marginBottom: 12 }}
                    />
                    {__('Google Map preview will appear here.', 'google-maps-block')}
                </div>
            )}
        </div>
    );
};

export default GoogleMapsBlockEdit;
