import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface ColorPaletteProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

let lastColorPaletteProps: ColorPaletteProps | null = null;

jest.mock("@wordpress/components", () => {
  const actual = jest.requireActual("@wordpress/components");
  return {
    ...actual,
    ColorPalette: (props: ColorPaletteProps) => {
      lastColorPaletteProps = props;
      return (
        <div>
          <button onClick={() => props.onChange("blue")}>pick-blue</button>
          <button onClick={() => props.onChange(undefined)}>clear-color</button>
        </div>
      );
    },
  };
});

import Edit from "./edit";

function baseAttributes(overrides: Record<string, unknown> = {}) {
  return {
    apiKey: "",
    address: "",
    lat: "",
    lng: "",
    zoom: 14,
    width: "100%",
    height: "25rem",
    mapType: "roadmap",
    showZoomControl: true,
    showStreetViewControl: true,
    showFullscreenControl: true,
    showMapTypeControl: true,
    markerLabel: "",
    markerTooltip: "",
    markerColor: "red",
    customCSS: "",
    showResetViewButton: false,
    ...overrides,
  };
}

function renderEdit(overrides: Record<string, unknown> = {}) {
  const setAttributes = jest.fn();
  const utils = render(
    <Edit attributes={baseAttributes(overrides) as never} setAttributes={setAttributes} />
  );
  return { ...utils, setAttributes };
}

afterEach(() => {
  lastColorPaletteProps = null;
  const script = document.getElementById("google-maps-js");
  if (script) {
    script.remove();
  }
  delete (window as { google?: unknown }).google;
});

describe("google-maps Edit — placeholder vs map", () => {
  it("shows the placeholder when there is no API key", () => {
    renderEdit({ apiKey: "" });

    expect(screen.getByAltText("Google Maps Placeholder")).toBeInTheDocument();
  });

  it("shows the placeholder when there is an API key but no address or coordinates", () => {
    renderEdit({ apiKey: "key" });

    expect(screen.getByAltText("Google Maps Placeholder")).toBeInTheDocument();
  });

  it("renders the map container once an API key and address are both set", () => {
    const { container } = renderEdit({ apiKey: "key", address: "1 Infinite Loop" });

    expect(screen.queryByAltText("Google Maps Placeholder")).not.toBeInTheDocument();
    expect(container.querySelector('div[style*="width"]')).toBeInTheDocument();
  });

  it("renders the map container when coordinates are set instead of an address", () => {
    renderEdit({ apiKey: "key", lat: "1", lng: "2" });

    expect(screen.queryByAltText("Google Maps Placeholder")).not.toBeInTheDocument();
  });
});

describe("google-maps Edit — settings wiring", () => {
  it("updates the API key", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Google Maps API Key"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ apiKey: "X" });
  });

  it("updates the address", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Address"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ address: "X" });
  });

  it("updates latitude and longitude", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Latitude"), "1");
    expect(setAttributes).toHaveBeenCalledWith({ lat: "1" });

    await user.type(screen.getByLabelText("Longitude"), "2");
    expect(setAttributes).toHaveBeenCalledWith({ lng: "2" });
  });

  it("updates the zoom level", () => {
    const { setAttributes } = renderEdit();

    fireEvent.change(screen.getByRole("slider", { name: "Zoom Level" }), {
      target: { value: "10" },
    });

    expect(setAttributes).toHaveBeenCalledWith({ zoom: 10 });
  });

  it("updates map width and height", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Map Width"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ width: "100%X" });

    await user.type(screen.getByLabelText("Map Height"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ height: "25remX" });
  });

  it("updates the map type", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.selectOptions(screen.getByRole("combobox", { name: "Map Type" }), "Satellite");

    expect(setAttributes).toHaveBeenCalledWith({ mapType: "satellite" });
  });

  it("toggles the zoom/street view/fullscreen/map type controls", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Show Zoom Control" }));
    expect(setAttributes).toHaveBeenCalledWith({ showZoomControl: false });

    await user.click(screen.getByRole("checkbox", { name: "Show Street View Control" }));
    expect(setAttributes).toHaveBeenCalledWith({ showStreetViewControl: false });

    await user.click(screen.getByRole("checkbox", { name: "Show Fullscreen Control" }));
    expect(setAttributes).toHaveBeenCalledWith({ showFullscreenControl: false });

    await user.click(screen.getByRole("checkbox", { name: "Show Map Type Control" }));
    expect(setAttributes).toHaveBeenCalledWith({ showMapTypeControl: false });
  });

  it("updates the marker label and tooltip", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Marker Label"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ markerLabel: "X" });

    await user.type(screen.getByLabelText("Marker Tooltip"), "X");
    expect(setAttributes).toHaveBeenCalledWith({ markerTooltip: "X" });
  });

  it("updates the marker color and falls back to red when cleared", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("button", { name: "pick-blue" }));
    expect(setAttributes).toHaveBeenCalledWith({ markerColor: "blue" });

    await user.click(screen.getByRole("button", { name: "clear-color" }));
    expect(setAttributes).toHaveBeenCalledWith({ markerColor: "red" });

    expect(lastColorPaletteProps?.value).toBe("red");
  });

  it("toggles the reset view button setting", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.click(screen.getByRole("checkbox", { name: "Show Reset View Button" }));

    expect(setAttributes).toHaveBeenCalledWith({ showResetViewButton: true });
  });

  it("keeps the Additional CSS panel collapsed by default and wires the textarea", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    expect(screen.queryByLabelText("Custom CSS")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Additional CSS" }));
    await user.type(screen.getByLabelText("Custom CSS"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ customCSS: "X" });
    expect(console).toHaveErrored();
  });
});

describe("google-maps Edit — map rendering with the Google Maps API present", () => {
  function installFakeGoogleMaps() {
    const script = document.createElement("script");
    script.id = "google-maps-js";
    document.body.appendChild(script);

    const setCenter = jest.fn();
    const setZoom = jest.fn();
    const addListener = jest.fn();
    const markerConstructions: Array<Record<string, unknown>> = [];
    const infoWindowOpen = jest.fn();

    (window as unknown as { google: unknown }).google = {
      maps: {
        Map: class {
          setCenter = setCenter;
          setZoom = setZoom;
        },
        Marker: class {
          constructor(options: Record<string, unknown>) {
            markerConstructions.push(options);
          }
          addListener = addListener;
        },
        Geocoder: class {
          geocode(
            _request: { address: string },
            callback: (results: unknown[], status: string) => void
          ) {
            callback([{ geometry: { location: { lat: 5, lng: 6 } } }], "OK");
          }
        },
        InfoWindow: class {
          open = infoWindowOpen;
        },
        SymbolPath: { CIRCLE: "circle" },
      },
    };

    return { setCenter, setZoom, addListener, markerConstructions, infoWindowOpen };
  }

  it("renders a marker at the given coordinates with the default (no icon) color", () => {
    const fakes = installFakeGoogleMaps();

    renderEdit({ apiKey: "key", lat: "1", lng: "2" });

    expect(fakes.markerConstructions).toHaveLength(1);
    expect(fakes.markerConstructions[0]).toMatchObject({ position: { lat: 1, lng: 2 } });
    expect(fakes.markerConstructions[0].icon).toBeUndefined();
  });

  it("gives the marker a custom icon when the color is not the default red", () => {
    const fakes = installFakeGoogleMaps();

    renderEdit({ apiKey: "key", lat: "1", lng: "2", markerColor: "blue" });

    expect(fakes.markerConstructions[0].icon).toMatchObject({ fillColor: "blue" });
  });

  it("geocodes the address and centers the marker on the result", () => {
    const fakes = installFakeGoogleMaps();

    renderEdit({ apiKey: "key", address: "1 Infinite Loop" });

    expect(fakes.setCenter).toHaveBeenCalledWith({ lat: 5, lng: 6 });
    expect(fakes.markerConstructions[0]).toMatchObject({ position: { lat: 5, lng: 6 } });
  });

  it("opens an info window immediately and wires it to the marker click when a tooltip is set", () => {
    const fakes = installFakeGoogleMaps();

    renderEdit({ apiKey: "key", lat: "1", lng: "2", markerTooltip: "Hello" });

    expect(fakes.infoWindowOpen).toHaveBeenCalled();
    expect(fakes.addListener).toHaveBeenCalledWith("click", expect.any(Function));
  });

  it("hides the Reset View button when the setting is disabled, even once the map has loaded", async () => {
    installFakeGoogleMaps();

    renderEdit({ apiKey: "key", lat: "1", lng: "2", showResetViewButton: false });

    expect(screen.queryByRole("button", { name: "Reset View" })).not.toBeInTheDocument();
  });

  it("shows the Reset View button once the map has loaded and the setting is enabled", async () => {
    installFakeGoogleMaps();

    renderEdit({ apiKey: "key", lat: "1", lng: "2", showResetViewButton: true });

    expect(await screen.findByRole("button", { name: "Reset View" })).toBeInTheDocument();
  });

  it("resets the map to its initial center and zoom when clicked", async () => {
    const fakes = installFakeGoogleMaps();
    const user = userEvent.setup();

    renderEdit({ apiKey: "key", lat: "1", lng: "2", zoom: 8, showResetViewButton: true });
    const resetButton = await screen.findByRole("button", { name: "Reset View" });

    await user.click(resetButton);

    expect(fakes.setCenter).toHaveBeenCalledWith({ lat: 1, lng: 2 });
    expect(fakes.setZoom).toHaveBeenCalledWith(8);
  });
});
