import React, { useEffect, useRef, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  RangeControl,
  SelectControl,
  ToggleControl,
  ColorPalette,
  TextareaControl,
  Button,
} from "@wordpress/components";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
        Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
        Geocoder: new () => GoogleGeocoderInstance;
        InfoWindow: new (options: Record<string, unknown>) => { open: (map: unknown, marker: unknown) => void };
        SymbolPath: { CIRCLE: unknown };
      };
    };
  }
}

interface GoogleMapInstance {
  setCenter: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleMarkerInstance {
  addListener: (event: string, callback: () => void) => void;
}

interface GoogleGeocoderInstance {
  geocode: (
    request: { address: string },
    callback: (results: Array<{ geometry: { location: { lat: number; lng: number } } }>, status: string) => void
  ) => void;
}

interface GoogleMapsBlockAttributes {
  apiKey: string;
  address: string;
  lat: string;
  lng: string;
  zoom: number;
  width: string;
  height: string;
  mapType: string;
  showZoomControl: boolean;
  showStreetViewControl: boolean;
  showFullscreenControl: boolean;
  showMapTypeControl: boolean;
  markerLabel: string;
  markerTooltip: string;
  markerColor: string;
  customCSS: string;
  showResetViewButton: boolean;
}

interface EditProps {
  attributes: GoogleMapsBlockAttributes;
  setAttributes: (attrs: Partial<GoogleMapsBlockAttributes>) => void;
}

const GoogleMapsBlockEdit = ({ attributes, setAttributes }: EditProps): React.ReactElement => {
  const blockProps = useBlockProps();
  const {
    apiKey = "",
    address = "",
    lat = "",
    lng = "",
    zoom = 14,
    width = "100%",
    height = "25rem",
    mapType = "roadmap",
    showZoomControl = true,
    showStreetViewControl = true,
    showFullscreenControl = true,
    showMapTypeControl = true,
    markerLabel = "",
    markerTooltip = "",
    markerColor = "red",
    customCSS = "",
  } = attributes;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<GoogleMapInstance | null>(null);
  const initialCenter = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
  const initialZoom = zoom;
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!apiKey || !(address || (lat && lng)) || !mapRef.current) return;

    const scriptId = "google-maps-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = renderMap;
      document.body.appendChild(script);
    } else {
      renderMap();
    }

    function renderMap() {
      if (!window.google || !window.google.maps || !mapRef.current) return;
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
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results[0]) {
            map.setCenter(results[0].geometry.location);
            addMarker(results[0].geometry.location);
          }
        });
      }

      function addMarker(position: { lat: number; lng: number }) {
        if (!window.google) return;
        const marker = new window.google.maps.Marker({
          position,
          map,
          label: markerLabel || undefined,
          icon:
            markerColor !== "red"
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: markerColor,
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#fff",
                }
              : undefined,
        });
        if (markerTooltip) {
          const infowindow = new window.google!.maps.InfoWindow({ content: markerTooltip });
          marker.addListener("click", () => {
            infowindow.open(map, marker);
          });
          infowindow.open(map, marker);
        }
      }
    }
    // eslint-disable-next-line
  }, [apiKey, address, lat, lng, zoom, mapType, showZoomControl, showStreetViewControl, showFullscreenControl, showMapTypeControl, markerLabel, markerTooltip, markerColor]);

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Map Settings", "kotlinskidev")}>
          <TextControl
            label={__("Google Maps API Key", "kotlinskidev")}
            value={apiKey}
            onChange={(value) => setAttributes({ apiKey: value })}
            help={__("Get your API key from https://console.cloud.google.com/apis/credentials", "kotlinskidev")}
          />
          <TextControl
            label={__("Address", "kotlinskidev")}
            value={address}
            onChange={(value) => setAttributes({ address: value })}
            help={__("Enter the address or leave blank to use coordinates.", "kotlinskidev")}
          />
          <TextControl label={__("Latitude", "kotlinskidev")} value={lat} onChange={(value) => setAttributes({ lat: value })} />
          <TextControl label={__("Longitude", "kotlinskidev")} value={lng} onChange={(value) => setAttributes({ lng: value })} />
          <RangeControl
            label={__("Zoom Level", "kotlinskidev")}
            value={zoom}
            onChange={(value) => setAttributes({ zoom: value ?? 14 })}
            min={1}
            max={21}
          />
          <TextControl
            label={__("Map Width", "kotlinskidev")}
            value={width}
            onChange={(value) => setAttributes({ width: value })}
            help={__("Any valid CSS width value, e.g. 100%, 37.5rem", "kotlinskidev")}
          />
          <TextControl
            label={__("Map Height", "kotlinskidev")}
            value={height}
            onChange={(value) => setAttributes({ height: value })}
            help={__("Any valid CSS height value, e.g. 25rem", "kotlinskidev")}
          />
          <SelectControl
            label={__("Map Type", "kotlinskidev")}
            value={mapType}
            options={[
              { label: __("Roadmap", "kotlinskidev"), value: "roadmap" },
              { label: __("Satellite", "kotlinskidev"), value: "satellite" },
              { label: __("Hybrid", "kotlinskidev"), value: "hybrid" },
              { label: __("Terrain", "kotlinskidev"), value: "terrain" },
            ]}
            onChange={(value) => setAttributes({ mapType: value })}
          />
          <ToggleControl
            label={__("Show Zoom Control", "kotlinskidev")}
            checked={!!showZoomControl}
            onChange={(value) => setAttributes({ showZoomControl: value })}
          />
          <ToggleControl
            label={__("Show Street View Control", "kotlinskidev")}
            checked={!!showStreetViewControl}
            onChange={(value) => setAttributes({ showStreetViewControl: value })}
          />
          <ToggleControl
            label={__("Show Fullscreen Control", "kotlinskidev")}
            checked={!!showFullscreenControl}
            onChange={(value) => setAttributes({ showFullscreenControl: value })}
          />
          <ToggleControl
            label={__("Show Map Type Control", "kotlinskidev")}
            checked={!!showMapTypeControl}
            onChange={(value) => setAttributes({ showMapTypeControl: value })}
          />
          <TextControl
            label={__("Marker Label", "kotlinskidev")}
            value={markerLabel}
            onChange={(value) => setAttributes({ markerLabel: value })}
            help={__("Short label for the marker (1-2 chars).", "kotlinskidev")}
          />
          <TextControl
            label={__("Marker Tooltip", "kotlinskidev")}
            value={markerTooltip}
            onChange={(value) => setAttributes({ markerTooltip: value })}
            help={__("Tooltip text shown when marker is clicked.", "kotlinskidev")}
          />
          <ColorPalette
            value={markerColor}
            onChange={(value) => setAttributes({ markerColor: value ?? "red" })}
            colors={[
              { name: "Red", color: "red" },
              { name: "Blue", color: "blue" },
              { name: "Green", color: "green" },
              { name: "Yellow", color: "yellow" },
              { name: "Purple", color: "purple" },
              { name: "Black", color: "black" },
            ]}
          />
          <ToggleControl
            label={__("Show Reset View Button", "kotlinskidev")}
            checked={!!attributes.showResetViewButton}
            onChange={(value) => setAttributes({ showResetViewButton: value })}
          />
        </PanelBody>
        <PanelBody title={__("Additional CSS", "kotlinskidev")} initialOpen={false}>
          <TextareaControl
            label={__("Custom CSS", "kotlinskidev")}
            value={customCSS}
            onChange={(value) => setAttributes({ customCSS: value })}
            help={__(
              "Add custom CSS to override Google Maps styles. Examples:\n\n" +
                "/* Hide Google Maps controls */\n" +
                ".gm-style-cc { display: none !important; }\n\n" +
                "/* Custom marker label styling */\n" +
                ".marker-position { margin-top: 3.4375rem; color: red; font-weight: bold; }\n\n" +
                '/* Hide "Map data" text */\n' +
                ".gm-style .gm-style-cc { display: none; }\n\n" +
                "/* Custom map container styling */\n" +
                ".gm-style { border-radius: 0.625rem; }",
              "kotlinskidev"
            )}
            rows={8}
            placeholder={__("/* Enter your custom CSS here */", "kotlinskidev")}
          />
        </PanelBody>
      </InspectorControls>
      <div style={{ position: "relative" }}>
        {apiKey && (address || (lat && lng)) ? (
          <div ref={mapRef} style={{ width, height }} />
        ) : (
          <div
            style={{
              width,
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f3f3f3",
              color: "#888",
              flexDirection: "column",
            }}
          >
            <img
              src="https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png"
              alt="Google Maps Placeholder"
              style={{ width: "4rem", height: "4rem", opacity: 0.5, marginBottom: "0.75rem" }}
            />
            {__("Google Map preview will appear here.", "kotlinskidev")}
          </div>
        )}
        {mapLoaded && attributes.showResetViewButton && (
          <Button
            style={{ position: "absolute", bottom: "0.625rem", left: "0.625rem", zIndex: 2 }}
            onClick={() => {
              if (mapInstance.current && initialCenter) {
                mapInstance.current.setCenter(initialCenter);
                mapInstance.current.setZoom(initialZoom);
              }
            }}
            variant="primary"
          >
            {__("Reset View", "kotlinskidev")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsBlockEdit;
