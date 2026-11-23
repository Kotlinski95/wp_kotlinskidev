import React, { useRef } from "react";
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { AdditionalCssPanel, MapSettingsPanel } from "./edit-panels";
import { resolveMapSettings, type MapSettings } from "./map-defaults";
import { hasMapLocation, parseCoordinates, useGoogleMap } from "./use-google-map";
import type { GoogleMapInstance, GoogleMapsPanelProps } from "./maps-types";

export type { GoogleMapsBlockAttributes } from "./maps-types";

const PLACEHOLDER_PEGMAN_URL = "https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png";

const MapPlaceholder = ({ width, height }: Pick<MapSettings, "width" | "height">): JSX.Element => (
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
      src={PLACEHOLDER_PEGMAN_URL}
      alt="Google Maps Placeholder"
      style={{ width: "4rem", height: "4rem", opacity: 0.5, marginBottom: "0.75rem" }}
    />
    {__("Google Map preview will appear here.", "kotlinskidev")}
  </div>
);

interface ResetViewButtonProps {
  mapInstance: React.MutableRefObject<GoogleMapInstance | null>;
  settings: MapSettings;
}

const ResetViewButton = ({ mapInstance, settings }: ResetViewButtonProps): JSX.Element => {
  const initialCenter = parseCoordinates(settings.lat, settings.lng);

  const resetView = (): void => {
    if (mapInstance.current && initialCenter) {
      mapInstance.current.setCenter(initialCenter);
      mapInstance.current.setZoom(settings.zoom);
    }
  };

  return (
    <Button
      style={{ position: "absolute", bottom: "0.625rem", left: "0.625rem", zIndex: 2 }}
      onClick={resetView}
      variant="primary"
    >
      {__("Reset View", "kotlinskidev")}
    </Button>
  );
};

const GoogleMapsBlockEdit = ({
  attributes,
  setAttributes,
}: GoogleMapsPanelProps): React.ReactElement => {
  const blockProps = useBlockProps();
  const settings = resolveMapSettings(attributes);
  const { width, height } = settings;
  const mapRef = useRef<HTMLDivElement>(null);
  const { mapInstance, mapLoaded } = useGoogleMap(mapRef, settings);

  return (
    <div {...blockProps}>
      <InspectorControls>
        <MapSettingsPanel attributes={attributes} setAttributes={setAttributes} />
        <AdditionalCssPanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <div style={{ position: "relative" }}>
        {hasMapLocation(settings) ? (
          <div ref={mapRef} style={{ width, height }} />
        ) : (
          <MapPlaceholder width={width} height={height} />
        )}
        {mapLoaded && attributes.showResetViewButton && (
          <ResetViewButton mapInstance={mapInstance} settings={settings} />
        )}
      </div>
    </div>
  );
};

export default GoogleMapsBlockEdit;
