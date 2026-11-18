import {
  getPaletteDuotoneData,
  injectPaletteDuotones,
  watchEditorCanvas,
} from "./palette-duotone-svg";

const SVG =
  '<svg data-kt-palette-duotones="1"><defs><filter id="kt-duotone-primary"></filter></defs></svg>';

describe("injectPaletteDuotones", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("inserts the svg once", () => {
    expect(injectPaletteDuotones(SVG, document)).toBe(true);
    expect(injectPaletteDuotones(SVG, document)).toBe(false);
    expect(document.querySelectorAll("svg[data-kt-palette-duotones]")).toHaveLength(1);
  });

  it("ignores empty markup and missing documents", () => {
    expect(injectPaletteDuotones("", document)).toBe(false);
    expect(injectPaletteDuotones(SVG, null)).toBe(false);
  });
});

describe("watchEditorCanvas", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("injects into the host document when there is no iframe", () => {
    const stop = watchEditorCanvas(SVG);
    expect(document.querySelector("#kt-duotone-primary")).not.toBeNull();
    stop();
  });

  it("injects into the editor canvas iframe and again after it reloads", async () => {
    const stop = watchEditorCanvas(SVG);
    const frame = document.createElement("iframe");
    frame.setAttribute("name", "editor-canvas");
    document.body.appendChild(frame);
    await Promise.resolve();

    const frameDoc = frame.contentDocument as Document;
    expect(frameDoc.querySelector("svg[data-kt-palette-duotones]")).not.toBeNull();

    frameDoc.body.innerHTML = "";
    frame.dispatchEvent(new Event("load"));
    expect(frameDoc.querySelector("svg[data-kt-palette-duotones]")).not.toBeNull();
    stop();
  });

  it("does nothing without markup", () => {
    watchEditorCanvas("")();
    expect(document.querySelector("svg")).toBeNull();
  });
});

describe("getPaletteDuotoneData", () => {
  it("normalises bad input", () => {
    expect(getPaletteDuotoneData(undefined)).toEqual({ svg: "", labels: {} });
    expect(getPaletteDuotoneData({ svg: 4, labels: "x" })).toEqual({ svg: "", labels: {} });
    expect(getPaletteDuotoneData({ svg: SVG, labels: { a: "A" } })).toEqual({
      svg: SVG,
      labels: { a: "A" },
    });
  });
});
