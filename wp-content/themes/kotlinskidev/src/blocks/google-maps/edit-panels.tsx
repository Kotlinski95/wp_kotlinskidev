import React from "react";
import { __ } from "@wordpress/i18n";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
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
import { BUTTON_STYLE_OPTIONS, resolveButtonStyle } from "@utils/button-style-variants";
import {
  DEFAULT_MARKER_COLOR,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  resolveMapSettings,
} from "./map-defaults";
import type { GoogleMapsPanelProps } from "./maps-types";

const CUSTOM_CSS_EXAMPLE = `/* Hide Google Maps controls */
.gm-style-cc { display: none !important; }

/* Custom marker label styling */
.marker-position { margin-top: 3.4375rem; color: red; font-weight: bold; }

/* Hide "Map data" text */
.gm-style .gm-style-cc { display: none; }

/* Custom map container styling */
.gm-style { border-radius: 0.625rem; }`;

const LocationFields = ({ attributes, setAttributes }: GoogleMapsPanelProps): JSX.Element => {
  const { apiKey, address, lat, lng } = resolveMapSettings(attributes);

  return (
    <>
      <TextControl
        label={__("Google Maps API Key", "kotlinskidev")}
        value={apiKey}
        onChange={(value) => setAttributes({ apiKey: value })}
        help={__(
          "Get your API key from https://console.cloud.google.com/apis/credentials",
          "kotlinskidev"
        )}
      />
      <TextControl
        label={__("Address", "kotlinskidev")}
        value={address}
        onChange={(value) => setAttributes({ address: value })}
        help={__("Enter the address or leave blank to use coordinates.", "kotlinskidev")}
      />
      <TextControl
        label={__("Latitude", "kotlinskidev")}
        value={lat}
        onChange={(value) => setAttributes({ lat: value })}
      />
      <TextControl
        label={__("Longitude", "kotlinskidev")}
        value={lng}
        onChange={(value) => setAttributes({ lng: value })}
      />
    </>
  );
};

const ViewFields = ({ attributes, setAttributes }: GoogleMapsPanelProps): JSX.Element => {
  const { zoom, width, height, mapType } = resolveMapSettings(attributes);

  return (
    <>
      <RangeControl
        label={__("Zoom Level", "kotlinskidev")}
        value={zoom}
        onChange={(value) => setAttributes({ zoom: value ?? DEFAULT_ZOOM })}
        min={MIN_ZOOM}
        max={MAX_ZOOM}
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
    </>
  );
};

const MapControlToggles = ({ attributes, setAttributes }: GoogleMapsPanelProps): JSX.Element => {
  const { showZoomControl, showStreetViewControl, showFullscreenControl, showMapTypeControl } =
    resolveMapSettings(attributes);

  return (
    <>
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
    </>
  );
};

const MarkerLogoPicker = ({ attributes, setAttributes }: GoogleMapsPanelProps): JSX.Element => (
  <MediaUploadCheck>
    <MediaUpload
      allowedTypes={["image"]}
      value={attributes.markerLogoId}
      onSelect={(media: { id: number; url: string }) =>
        setAttributes({ markerLogoId: media.id, markerLogoUrl: media.url })
      }
      render={({ open }: { open: () => void }) => (
        <div className="kt-google-maps__logo-control">
          {attributes.markerLogoUrl ? (
            <img
              src={attributes.markerLogoUrl}
              alt=""
              width={40}
              height={40}
              style={{ borderRadius: "0.5rem", objectFit: "cover" }}
            />
          ) : null}
          <Button variant="secondary" onClick={open}>
            {attributes.markerLogoUrl
              ? __("Replace marker logo", "kotlinskidev")
              : __("Select marker logo", "kotlinskidev")}
          </Button>
          {attributes.markerLogoUrl ? (
            <Button
              variant="link"
              isDestructive
              onClick={() => setAttributes({ markerLogoId: 0, markerLogoUrl: "" })}
            >
              {__("Remove marker logo", "kotlinskidev")}
            </Button>
          ) : null}
        </div>
      )}
    />
  </MediaUploadCheck>
);

const MarkerFields = ({ attributes, setAttributes }: GoogleMapsPanelProps): JSX.Element => {
  const { markerLabel, markerTooltip, markerColor } = resolveMapSettings(attributes);

  return (
    <>
      <TextControl
        label={__("Marker Label", "kotlinskidev")}
        value={markerLabel}
        onChange={(value) => setAttributes({ markerLabel: value })}
        help={__("Name shown in bold on the marker card.", "kotlinskidev")}
      />
      <TextControl
        label={__("Marker Tooltip", "kotlinskidev")}
        value={markerTooltip}
        onChange={(value) => setAttributes({ markerTooltip: value })}
        help={__("Tagline shown under the name on the marker card.", "kotlinskidev")}
      />
      <MarkerLogoPicker attributes={attributes} setAttributes={setAttributes} />
      <ColorPalette
        value={markerColor}
        onChange={(value) => setAttributes({ markerColor: value ?? DEFAULT_MARKER_COLOR })}
        colors={[
          { name: "Red", color: "red" },
          { name: "Blue", color: "blue" },
          { name: "Green", color: "green" },
          { name: "Yellow", color: "yellow" },
          { name: "Purple", color: "purple" },
          { name: "Black", color: "black" },
        ]}
      />
    </>
  );
};

const ButtonFields = ({ attributes, setAttributes }: GoogleMapsPanelProps): JSX.Element => (
  <>
    <ToggleControl
      label={__("Show Reset View Button", "kotlinskidev")}
      checked={!!attributes.showResetViewButton}
      onChange={(value) => setAttributes({ showResetViewButton: value })}
    />
    <SelectControl
      label={__("Button style", "kotlinskidev")}
      value={resolveButtonStyle(attributes.buttonStyle)}
      options={[...BUTTON_STYLE_OPTIONS]}
      onChange={(value) => setAttributes({ buttonStyle: value })}
    />
    <TextControl
      label={__("Cookie settings button label", "kotlinskidev")}
      value={attributes.consentButtonLabel ?? ""}
      onChange={(value) => setAttributes({ consentButtonLabel: value })}
      placeholder={__("Cookie settings", "kotlinskidev")}
    />
    <TextControl
      label={__("Reset View button label", "kotlinskidev")}
      value={attributes.resetViewLabel ?? ""}
      onChange={(value) => setAttributes({ resetViewLabel: value })}
      placeholder={__("Reset View", "kotlinskidev")}
    />
  </>
);

export const MapSettingsPanel = (props: GoogleMapsPanelProps): JSX.Element => (
  <PanelBody title={__("Map Settings", "kotlinskidev")}>
    <LocationFields {...props} />
    <ViewFields {...props} />
    <MapControlToggles {...props} />
    <MarkerFields {...props} />
    <ButtonFields {...props} />
  </PanelBody>
);

export const AdditionalCssPanel = ({
  attributes,
  setAttributes,
}: GoogleMapsPanelProps): JSX.Element => {
  const { customCSS } = resolveMapSettings(attributes);

  return (
    <PanelBody title={__("Additional CSS", "kotlinskidev")} initialOpen={false}>
      <TextareaControl
        label={__("Custom CSS", "kotlinskidev")}
        value={customCSS}
        onChange={(value) => setAttributes({ customCSS: value })}
        help={
          <>
            {__("Add custom CSS to override Google Maps styles. Examples:", "kotlinskidev")}
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.75rem" }}>{CUSTOM_CSS_EXAMPLE}</pre>
          </>
        }
        rows={8}
        placeholder={__("/* Enter your custom CSS here */", "kotlinskidev")}
      />
    </PanelBody>
  );
};
