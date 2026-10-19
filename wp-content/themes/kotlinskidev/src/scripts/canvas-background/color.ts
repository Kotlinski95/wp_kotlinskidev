const rgb01Cache = new Map<string, [number, number, number]>();

const colorProbe = document.createElement("canvas");
colorProbe.width = 1;
colorProbe.height = 1;
const colorProbeCtx = colorProbe.getContext("2d", { willReadFrequently: true });

export const parseColorToRgb01 = (cssColor: string): [number, number, number] => {
  const cached = rgb01Cache.get(cssColor);
  if (cached) {
    return cached;
  }
  if (!colorProbeCtx) {
    return [1, 1, 1];
  }
  colorProbeCtx.clearRect(0, 0, 1, 1);
  colorProbeCtx.fillStyle = cssColor;
  colorProbeCtx.fillRect(0, 0, 1, 1);
  const [r, g, b] = colorProbeCtx.getImageData(0, 0, 1, 1).data;
  const result: [number, number, number] = [r / 255, g / 255, b / 255];
  rgb01Cache.set(cssColor, result);
  return result;
};
