declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
        Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
        Geocoder: new () => GoogleGeocoderInstance;
        InfoWindow: new (options: Record<string, unknown>) => {
          open: (map: unknown, marker: unknown) => void;
        };
        SymbolPath: { CIRCLE: unknown };
      };
    };
  }
}

export interface GoogleMapInstance {
  setCenter: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleMarkerInstance {
  addListener: (event: string, callback: () => void) => void;
}

interface GoogleGeocoderInstance {
  geocode: (
    request: { address: string },
    callback: (
      results: Array<{ geometry: { location: { lat: number; lng: number } } }>,
      status: string
    ) => void
  ) => void;
}

export interface GoogleMapsBlockAttributes {
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
  markerLogoUrl: string;
  markerLogoId: number;
  buttonStyle: string;
  consentButtonLabel: string;
  resetViewLabel: string;
  customCSS: string;
  showResetViewButton: boolean;
}

export interface GoogleMapsPanelProps {
  attributes: GoogleMapsBlockAttributes;
  setAttributes: (attrs: Partial<GoogleMapsBlockAttributes>) => void;
}

export interface LatLng {
  lat: number;
  lng: number;
}
