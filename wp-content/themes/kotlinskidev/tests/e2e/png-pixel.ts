import zlib from "node:zlib";

interface DecodedPng {
  width: number;
  height: number;
  channels: number;
  data: Buffer;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) {
    return a;
  }
  if (pb <= pc) {
    return b;
  }
  return c;
}

function channelsForColorType(colorType: number): number {
  if (colorType === 6) {
    return 4;
  }
  if (colorType === 2) {
    return 3;
  }
  return 1;
}

export function decodePng(buffer: Buffer): DecodedPng {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;

    if (type === "IHDR") {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      colorType = buffer.readUInt8(dataStart + 9);
    } else if (type === "IDAT") {
      idatChunks.push(buffer.subarray(dataStart, dataStart + length));
    } else if (type === "IEND") {
      break;
    }

    offset = dataStart + length + 4;
  }

  const channels = channelsForColorType(colorType);
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filterType = raw[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const rawValue = raw[rowStart + x];
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? out[(y - 1) * stride + x - channels] : 0;
      let value: number;
      switch (filterType) {
        case 1:
          value = rawValue + a;
          break;
        case 2:
          value = rawValue + b;
          break;
        case 3:
          value = rawValue + Math.floor((a + b) / 2);
          break;
        case 4:
          value = rawValue + paeth(a, b, c);
          break;
        default:
          value = rawValue;
      }
      out[y * stride + x] = value % 256;
    }
  }

  return { width, height, channels, data: out };
}

export function getPixel(png: DecodedPng, x: number, y: number): [number, number, number, number] {
  const i = (y * png.width + x) * png.channels;
  return [
    png.data[i],
    png.data[i + 1],
    png.data[i + 2],
    png.channels === 4 ? png.data[i + 3] : 255,
  ];
}
