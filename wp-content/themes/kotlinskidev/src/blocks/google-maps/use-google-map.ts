import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_MARKER_COLOR, type MapSettings } from "./map-defaults";
import type { GoogleMapInstance, LatLng } from "./maps-types";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-js";
const MARKER_CIRCLE_SCALE = 8;
const MARKER_STROKE_COLOR = "#fff";

export const parseCoordinates = (lat: string, lng: string): LatLng | undefined =>
  lat && lng ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) } : undefined;

const buildMarkerIcon = (markerColor: string): Record<string, unknown> | undefined => {
  if (markerColor === DEFAULT_MARKER_COLOR || !window.google) {
    return undefined;
  }
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: MARKER_CIRCLE_SCALE,
    fillColor: markerColor,
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: MARKER_STROKE_COLOR,
  };
};

const addMarker = (map: GoogleMapInstance, position: LatLng, settings: MapSettings): void => {
  if (!window.google) {
    return;
  }
  const { markerLabel, markerTooltip, markerColor } = settings;
  const marker = new window.google.maps.Marker({
    position,
    map,
    label: markerLabel || undefined,
    icon: buildMarkerIcon(markerColor),
  });
  if (markerTooltip) {
    const infowindow = new window.google.maps.InfoWindow({ content: markerTooltip });
    marker.addListener("click", () => {
      infowindow.open(map, marker);
    });
    infowindow.open(map, marker);
  }
};

const createMap = (container: HTMLElement, settings: MapSettings): GoogleMapInstance | null => {
  if (!window.google) {
    return null;
  }
  const center = parseCoordinates(settings.lat, settings.lng);
  return new window.google.maps.Map(container, {
    center: center || { lat: 0, lng: 0 },
    zoom: settings.zoom,
    mapTypeId: settings.mapType,
    zoomControl: settings.showZoomControl,
    streetViewControl: settings.showStreetViewControl,
    fullscreenControl: settings.showFullscreenControl,
    mapTypeControl: settings.showMapTypeControl,
  });
};

const placeInitialMarker = (map: GoogleMapInstance, settings: MapSettings): void => {
  const center = parseCoordinates(settings.lat, settings.lng);
  if (center) {
    addMarker(map, center, settings);
    return;
  }
  if (!settings.address || !window.google) {
    return;
  }
  const geocoder = new window.google.maps.Geocoder();
  geocoder.geocode({ address: settings.address }, (results, status) => {
    if (status === "OK" && results[0]) {
      map.setCenter(results[0].geometry.location);
      addMarker(map, results[0].geometry.location, settings);
    }
  });
};

const loadGoogleMapsScript = (apiKey: string, onLoad: () => void): void => {
  if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
    onLoad();
    return;
  }
  const script = document.createElement("script");
  script.id = GOOGLE_MAPS_SCRIPT_ID;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
  script.async = true;
  script.onload = onLoad;
  document.body.appendChild(script);
};

export const hasMapLocation = ({ apiKey, address, lat, lng }: MapSettings): boolean =>
  Boolean(apiKey && (address || (lat && lng)));

export const useGoogleMap = (
  mapRef: React.RefObject<HTMLDivElement>,
  allSettings: MapSettings
): { mapInstance: React.MutableRefObject<GoogleMapInstance | null>; mapLoaded: boolean } => {
  const mapInstance = useRef<GoogleMapInstance | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const settings = useMemo(
    () => allSettings,
    [
      allSettings.apiKey,
      allSettings.address,
      allSettings.lat,
      allSettings.lng,
      allSettings.zoom,
      allSettings.mapType,
      allSettings.showZoomControl,
      allSettings.showStreetViewControl,
      allSettings.showFullscreenControl,
      allSettings.showMapTypeControl,
      allSettings.markerLabel,
      allSettings.markerTooltip,
      allSettings.markerColor,
    ]
  );

  useEffect(() => {
    if (!hasMapLocation(settings) || !mapRef.current) {
      return;
    }

    const renderMap = (): void => {
      if (!window.google || !window.google.maps || !mapRef.current) {
        return;
      }
      const map = createMap(mapRef.current, settings);
      if (!map) {
        return;
      }
      mapInstance.current = map;
      setMapLoaded(true);
      placeInitialMarker(map, settings);
    };

    loadGoogleMapsScript(settings.apiKey, renderMap);
  }, [mapRef, settings]);

  return { mapInstance, mapLoaded };
};
