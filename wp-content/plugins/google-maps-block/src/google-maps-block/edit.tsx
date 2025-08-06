import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, RangeControl, SelectControl, ToggleControl, ColorPalette, TextareaControl, Button } from '@wordpress/components';
import React, { useEffect, useRef } from 'react';
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
    const { apiKey = '', address = '', lat = '', lng = '', zoom = 14, width = '100%', height = '400px', mapType = 'roadmap', showZoomControl = true, showStreetViewControl = true, showFullscreenControl = true, showMapTypeControl = true, markerLabel = '', markerTooltip = '', markerColor = 'red', customCSS = '' } = attributes;

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef(null);
    const initialCenter = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
    const initialZoom = zoom;
    const [mapLoaded, setMapLoaded] = React.useState(false);

    useEffect(() => {
        if (!apiKey || !(address || (lat && lng)) || !mapRef.current) return;
        // Load Google Maps JS API
        const scriptId = 'google-maps-js';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.async = true;
            script.onload = renderMap;
            document.body.appendChild(script);
        } else {
            renderMap();
        }
        function renderMap() {
            // @ts-ignore
            if (!window.google || !window.google.maps) return;
            const center = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
            const geocoder = new window.google.maps.Geocoder();
            const map = new window.google.maps.Map(mapRef.current, {
                center: center || { lat: 0, lng: 0 },
                zoom,
                mapTypeId: mapType,
                zoomControl: showZoomControl,
                streetViewControl: showStreetViewControl,
                fullscreenControl: showFullscreenControl,
                mapTypeControl: showMapTypeControl,
            });
            mapInstance.current = map;
            setMapLoaded(true);
            if (center) {
                addMarker(center);
            } else if (address) {
                geocoder.geocode({ address }, (results: any, status: string) => {
                    if (status === 'OK' && results[0]) {
                        map.setCenter(results[0].geometry.location);
                        addMarker(results[0].geometry.location);
                    }
                });
            }
            function addMarker(position: any) {
                const marker = new window.google.maps.Marker({
                    position,
                    map,
                    label: markerLabel || undefined,
                    icon: markerColor !== 'red' ? {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: markerColor,
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: '#fff',
                    } : undefined,
                });
                if (markerTooltip) {
                    const infowindow = new window.google.maps.InfoWindow({ content: markerTooltip });
                    marker.addListener('click', () => {
                        infowindow.open(map, marker);
                    });
                    // Optionally open by default:
                    infowindow.open(map, marker);
                }
            }
        }
        // eslint-disable-next-line
    }, [apiKey, address, lat, lng, zoom, mapType, showZoomControl, showStreetViewControl, showFullscreenControl, showMapTypeControl, markerLabel, markerTooltip, markerColor]);

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
                    <SelectControl
                        label={__('Map Type', 'google-maps-block')}
                        value={mapType}
                        options={[
                            { label: __('Roadmap', 'google-maps-block'), value: 'roadmap' },
                            { label: __('Satellite', 'google-maps-block'), value: 'satellite' },
                            { label: __('Hybrid', 'google-maps-block'), value: 'hybrid' },
                            { label: __('Terrain', 'google-maps-block'), value: 'terrain' },
                        ]}
                        onChange={(value) => setAttributes({ mapType: value })}
                    />
                    <ToggleControl
                        label={__('Show Zoom Control', 'google-maps-block')}
                        checked={!!showZoomControl}
                        onChange={(value) => setAttributes({ showZoomControl: value })}
                    />
                    <ToggleControl
                        label={__('Show Street View Control', 'google-maps-block')}
                        checked={!!showStreetViewControl}
                        onChange={(value) => setAttributes({ showStreetViewControl: value })}
                    />
                    <ToggleControl
                        label={__('Show Fullscreen Control', 'google-maps-block')}
                        checked={!!showFullscreenControl}
                        onChange={(value) => setAttributes({ showFullscreenControl: value })}
                    />
                    <ToggleControl
                        label={__('Show Map Type Control', 'google-maps-block')}
                        checked={!!showMapTypeControl}
                        onChange={(value) => setAttributes({ showMapTypeControl: value })}
                    />
                    <TextControl
                        label={__('Marker Label', 'google-maps-block')}
                        value={markerLabel}
                        onChange={(value) => setAttributes({ markerLabel: value })}
                        help={__('Short label for the marker (1-2 chars).', 'google-maps-block')}
                    />
                    <TextControl
                        label={__('Marker Tooltip', 'google-maps-block')}
                        value={markerTooltip}
                        onChange={(value) => setAttributes({ markerTooltip: value })}
                        help={__('Tooltip text shown when marker is clicked.', 'google-maps-block')}
                    />
                    <ColorPalette
                        label={__('Marker Color', 'google-maps-block')}
                        value={markerColor}
                        onChange={(value) => setAttributes({ markerColor: value })}
                        colors={[
                            { name: 'Red', color: 'red' },
                            { name: 'Blue', color: 'blue' },
                            { name: 'Green', color: 'green' },
                            { name: 'Yellow', color: 'yellow' },
                            { name: 'Purple', color: 'purple' },
                            { name: 'Black', color: 'black' },
                        ]}
                    />
                    <ToggleControl
                        label={__('Show Reset View Button', 'google-maps-block')}
                        checked={!!attributes.showResetViewButton}
                        onChange={(value) => setAttributes({ showResetViewButton: value })}
                    />
                </PanelBody>
                <PanelBody title={__('Additional CSS', 'google-maps-block')} initialOpen={false}>
                    <TextareaControl
                        label={__('Custom CSS', 'google-maps-block')}
                        value={customCSS}
                        onChange={(value) => setAttributes({ customCSS: value })}
                        help={__(
                            'Add custom CSS to override Google Maps styles. Examples:\n\n' +
                            '/* Hide Google Maps controls */\n' +
                            '.gm-style-cc { display: none !important; }\n\n' +
                            '/* Custom marker label styling */\n' +
                            '.marker-position { margin-top: 55px; color: red; font-weight: bold; }\n\n' +
                            '/* Hide "Map data" text */\n' +
                            '.gm-style .gm-style-cc { display: none; }\n\n' +
                            '/* Custom map container styling */\n' +
                            '.gm-style { border-radius: 10px; }',
                            'google-maps-block'
                        )}
                        rows={8}
                        placeholder={__('/* Enter your custom CSS here */', 'google-maps-block')}
                    />
                </PanelBody>
            </InspectorControls>
            <div style={{ position: 'relative' }}>
                {apiKey && (address || (lat && lng)) ? (
                    <div ref={mapRef} style={{ width, height }} />
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
                {mapLoaded && attributes.showResetViewButton && (
                    <Button
                        style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 2 }}
						className="test123"
                        onClick={() => {
                            if (mapInstance.current && initialCenter) {
                                mapInstance.current.setCenter(initialCenter);
                                mapInstance.current.setZoom(initialZoom);
                            }
                        }}
                        variant="primary"
                    >
                        {__('Reset View', 'google-maps-block')}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default GoogleMapsBlockEdit;
