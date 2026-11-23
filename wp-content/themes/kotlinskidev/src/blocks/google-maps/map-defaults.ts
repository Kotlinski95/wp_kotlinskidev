import type { GoogleMapsBlockAttributes } from "./maps-types";

export const DEFAULT_ZOOM = 14;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 21;
export const DEFAULT_MARKER_COLOR = "red";

export interface MapSettings {
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
}

export const resolveMapSettings = (attributes: GoogleMapsBlockAttributes): MapSettings => {
  const {
    apiKey = "",
    address = "",
    lat = "",
    lng = "",
    zoom = DEFAULT_ZOOM,
    width = "100%",
    height = "25rem",
    mapType = "roadmap",
    showZoomControl = true,
    showStreetViewControl = true,
    showFullscreenControl = true,
    showMapTypeControl = true,
    markerLabel = "",
    markerTooltip = "",
    markerColor = DEFAULT_MARKER_COLOR,
    customCSS = "",
  } = attributes;
  return {
    apiKey,
    address,
    lat,
    lng,
    zoom,
    width,
    height,
    mapType,
    showZoomControl,
    showStreetViewControl,
    showFullscreenControl,
    showMapTypeControl,
    markerLabel,
    markerTooltip,
    markerColor,
    customCSS,
  };
};
