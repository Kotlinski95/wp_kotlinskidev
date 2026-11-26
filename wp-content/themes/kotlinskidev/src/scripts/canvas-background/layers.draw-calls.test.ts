import { createHash } from "crypto";
import type { CanvasLayerDraw, CanvasLayerParams } from "./types";

type RecordedValue = unknown;
type ContextMode = "normal" | "no-context" | "compile-fail" | "link-fail";
type ScenarioVariant = "frames" | "context-events" | ContextMode;

interface RecordedObject {
  [key: string]: unknown;
}

const FRAME_TIMES = [0, 16, 500, 1500, 4000, 12345.678];
const LARGE_SIZE = { width: 800, height: 600 };
const SMALL_SIZE = { width: 390, height: 844 };
const MAX_INLINE_ARRAY_LENGTH = 64;
const MAX_INLINE_STRING_LENGTH = 120;

const PARAM_SETS: Record<string, CanvasLayerParams> = {
  defaults: {},
  custom: {
    speed: 2.5,
    opacity: 0.5,
    color: "#ff8800",
    colorStart: "#112233",
    colorEnd: "#445566",
    zoom: 1.7,
    intensity: 1.3,
    rayCount: 5.4,
    layerCount: 4,
    count: 5,
    radiusPct: 40,
    angleDeg: 70,
    width: 0.3,
    lineCount: 7,
    grainSize: 3,
    jitterAmount: 2,
    decay: 0.95,
    density: 2,
  },
  clamps: {
    speed: 0,
    opacity: 0.2,
    count: 0,
    rayCount: 0,
    lineCount: 0,
    layerCount: 0,
    grainSize: 0,
    width: 5,
    radiusPct: 0,
    color: "",
    colorStart: "#abcdef",
    colorEnd: "",
  },
  hidden: { opacity: 0, speed: -1, color: "var(--wp--preset--color--primary)" },
};

const SIGNIFICANT_DIGITS = 9;

const stableNumber = (value: number): string =>
  Number.isFinite(value) ? String(Number(value.toPrecision(SIGNIFICANT_DIGITS))) : String(value);

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

const LCG_MULTIPLIER = 1664525;
const LCG_INCREMENT = 1013904223;
const LCG_MODULUS = 4294967296;

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
    return state / LCG_MODULUS;
  };
};

class ScenarioRecorder {
  readonly log: string[] = [];
  private nextId = 1;
  contextMode: ContextMode = "normal";
  readonly canvasListeners = new Map<RecordedObject, Map<string, (event: unknown) => void>>();

  allocateId(): number {
    return this.nextId++;
  }

  format(value: RecordedValue): string {
    if (value === null) {
      return "null";
    }
    if (typeof value === "string") {
      return value.length > MAX_INLINE_STRING_LENGTH
        ? `str:${value.length}:${sha256(value)}`
        : JSON.stringify(value);
    }
    if (typeof value === "number") {
      return stableNumber(value);
    }
    if (typeof value === "boolean" || value === undefined) {
      return String(value);
    }
    if (typeof value === "function") {
      return "fn";
    }
    if (ArrayBuffer.isView(value)) {
      const items = Array.from(value as unknown as ArrayLike<number>).map(stableNumber);
      const body =
        items.length > MAX_INLINE_ARRAY_LENGTH ? sha256(items.join(",")) : items.join(",");
      return `${value.constructor.name}(${items.length})[${body}]`;
    }
    const record = value as RecordedObject;
    if (typeof record.recordedId === "number") {
      const data = record.data;
      return data !== undefined
        ? `#${record.recordedId}{${this.format(data)}}`
        : `#${record.recordedId}`;
    }
    return JSON.stringify(value);
  }

  write(entry: string): void {
    this.log.push(entry);
  }

  call(owner: string, method: string, args: RecordedValue[]): void {
    this.write(`${owner}.${method}(${args.map((arg) => this.format(arg)).join(",")})`);
  }
}

const GL_CONSTANT_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const createGradientLike = (recorder: ScenarioRecorder, kind: string, args: unknown[]) => {
  const id = recorder.allocateId();
  recorder.call("ctx", kind, args);
  return {
    recordedId: id,
    addColorStop: (...stopArgs: unknown[]) => recorder.call(`#${id}`, "addColorStop", stopArgs),
    setTransform: (...transformArgs: unknown[]) =>
      recorder.call(`#${id}`, "setTransform", transformArgs),
  };
};

const createRecordingContext2d = (
  recorder: ScenarioRecorder,
  owner: string,
  canvas: RecordedObject
): CanvasRenderingContext2D => {
  const store: RecordedObject = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    fillStyle: "#000000",
    strokeStyle: "#000000",
    lineWidth: 1,
    canvas,
  };

  const handler: ProxyHandler<RecordedObject> = {
    get(target, property) {
      if (typeof property !== "string") {
        return undefined;
      }
      if (property in store) {
        return store[property];
      }
      if (
        property === "createLinearGradient" ||
        property === "createRadialGradient" ||
        property === "createConicGradient"
      ) {
        return (...args: unknown[]) => createGradientLike(recorder, property, args);
      }
      if (property === "createPattern") {
        return (...args: unknown[]) => {
          recorder.call(owner, property, args);
          return createGradientLike(recorder, "pattern", []);
        };
      }
      if (property === "createImageData") {
        return (...args: unknown[]) => {
          recorder.call(owner, property, args);
          const [imageWidth, imageHeight] = args as [number, number];
          return {
            recordedId: recorder.allocateId(),
            width: imageWidth,
            height: imageHeight,
            data: new Uint8ClampedArray(imageWidth * imageHeight * 4),
          };
        };
      }
      if (property === "getImageData") {
        return (...args: unknown[]) => {
          recorder.call(owner, property, args);
          const digest = sha256(String(store.fillStyle));
          const data = new Uint8ClampedArray(4);
          for (let index = 0; index < 4; index++) {
            data[index] = parseInt(digest.slice(index * 2, index * 2 + 2), 16);
          }
          return { recordedId: recorder.allocateId(), data };
        };
      }
      return (...args: unknown[]) => {
        recorder.call(owner, property, args);
        return undefined;
      };
    },
    set(target, property, value) {
      store[String(property)] = value;
      recorder.write(`${owner}.${String(property)}=${recorder.format(value)}`);
      return true;
    },
  };

  return new Proxy({}, handler) as unknown as CanvasRenderingContext2D;
};

const createRecordingGl = (recorder: ScenarioRecorder, owner: string): WebGLRenderingContext => {
  const handler: ProxyHandler<RecordedObject> = {
    get(target, property) {
      if (typeof property !== "string") {
        return undefined;
      }
      if (GL_CONSTANT_PATTERN.test(property)) {
        return property;
      }
      return (...args: unknown[]) => {
        recorder.call(owner, property, args);
        if (property === "getShaderParameter") {
          return recorder.contextMode !== "compile-fail";
        }
        if (property === "getProgramParameter") {
          return recorder.contextMode !== "link-fail";
        }
        if (property === "getAttribLocation") {
          return String(args[1]).length;
        }
        if (property.startsWith("create") || property === "getUniformLocation") {
          return { recordedId: recorder.allocateId() };
        }
        return undefined;
      };
    },
  };
  return new Proxy({}, handler) as unknown as WebGLRenderingContext;
};

const createRecordingCanvas = (recorder: ScenarioRecorder): HTMLCanvasElement => {
  const id = recorder.allocateId();
  const owner = `canvas#${id}`;
  const store: RecordedObject = { recordedId: id };
  recorder.write(`createElement(canvas)=#${id}`);
  const listeners = new Map<string, (event: unknown) => void>();
  recorder.canvasListeners.set(store, listeners);

  const handler: ProxyHandler<RecordedObject> = {
    get(target, property) {
      if (typeof property !== "string") {
        return undefined;
      }
      if (property in store) {
        return store[property];
      }
      if (property === "getContext") {
        return (type: string, options?: unknown) => {
          recorder.call(owner, "getContext", [type, options]);
          if (recorder.contextMode === "no-context") {
            return null;
          }
          if (type === "2d") {
            return createRecordingContext2d(recorder, `ctx#${id}`, proxy as RecordedObject);
          }
          return createRecordingGl(recorder, `gl#${id}:${type}`);
        };
      }
      if (property === "addEventListener") {
        return (eventName: string, listener: (event: unknown) => void) => {
          recorder.call(owner, "addEventListener", [eventName]);
          listeners.set(eventName, listener);
        };
      }
      return (...args: unknown[]) => {
        recorder.call(owner, property, args);
      };
    },
    set(target, property, value) {
      store[String(property)] = value;
      recorder.write(`${owner}.${String(property)}=${recorder.format(value)}`);
      return true;
    },
  };

  const proxy = new Proxy({}, handler);
  return proxy as unknown as HTMLCanvasElement;
};

const dispatchContextEvent = (
  recorder: ScenarioRecorder,
  eventName: "webglcontextlost" | "webglcontextrestored"
): void => {
  recorder.write(`event(${eventName})`);
  recorder.canvasListeners.forEach((listeners) => {
    const listener = listeners.get(eventName);
    listener?.({ preventDefault: () => recorder.write("event.preventDefault()") });
  });
};

class RecordingDomMatrix {
  constructor(private readonly recorder?: ScenarioRecorder) {}
  translate(...args: unknown[]): RecordingDomMatrix {
    currentRecorder?.call("DOMMatrix", "translate", args);
    return this;
  }
}

let currentRecorder: ScenarioRecorder | undefined;

const loadLayerDraw = (layerName: string): CanvasLayerDraw => {
  let draw: CanvasLayerDraw | undefined;
  jest.isolateModules(() => {
    const { layerRegistry } = require("./registry");
    draw = layerRegistry[layerName];
  });
  return draw as CanvasLayerDraw;
};

const drawFrame = (
  draw: CanvasLayerDraw,
  recorder: ScenarioRecorder,
  mainContext: CanvasRenderingContext2D,
  options: {
    size: { width: number; height: number };
    time: number;
    params: CanvasLayerParams;
    cache: Record<string, unknown>;
  }
): void => {
  recorder.write(`frame(${options.time},${options.size.width}x${options.size.height})`);
  draw(mainContext, {
    width: options.size.width,
    height: options.size.height,
    time: options.time,
    params: options.params,
    resolveColor: (value: string) => {
      recorder.write(`resolveColor(${JSON.stringify(value)})`);
      return value || "#000000";
    },
    cache: options.cache,
  });
};

const runScenario = (
  layerName: string,
  params: CanvasLayerParams,
  variant: ScenarioVariant
): string[] => {
  const recorder = new ScenarioRecorder();
  currentRecorder = recorder;
  const originalRandom = Math.random;
  Math.random = createSeededRandom(1234567);
  (global as unknown as { DOMMatrix: unknown }).DOMMatrix = RecordingDomMatrix;

  const createElementSpy = jest.spyOn(document, "createElement").mockImplementation(((
    tagName: string
  ) => {
    if (tagName === "canvas") {
      return createRecordingCanvas(recorder);
    }
    throw new Error(`unexpected createElement(${tagName})`);
  }) as typeof document.createElement);

  try {
    const draw = loadLayerDraw(layerName);
    if (variant === "no-context" || variant === "compile-fail" || variant === "link-fail") {
      recorder.contextMode = variant;
    }

    const mainCanvas = createRecordingCanvas(recorder) as unknown as RecordedObject;
    const mainContext = createRecordingContext2d(recorder, "main", mainCanvas);
    const cache: Record<string, unknown> = {};

    FRAME_TIMES.forEach((time) => {
      drawFrame(draw, recorder, mainContext, { size: LARGE_SIZE, time, params, cache });
    });

    if (variant === "context-events") {
      dispatchContextEvent(recorder, "webglcontextlost");
      drawFrame(draw, recorder, mainContext, { size: LARGE_SIZE, time: 17000, params, cache });
      dispatchContextEvent(recorder, "webglcontextrestored");
      drawFrame(draw, recorder, mainContext, { size: LARGE_SIZE, time: 17016, params, cache });
    }

    drawFrame(draw, recorder, mainContext, { size: SMALL_SIZE, time: 18000, params, cache });
    drawFrame(draw, recorder, mainContext, { size: SMALL_SIZE, time: 18016, params, cache });
    drawFrame(draw, recorder, mainContext, { size: LARGE_SIZE, time: 19000, params, cache });
  } finally {
    createElementSpy.mockRestore();
    Math.random = originalRandom;
    currentRecorder = undefined;
  }

  return recorder.log;
};

const LAYER_NAMES = [
  "gradient",
  "noise",
  "grid-lines",
  "blob",
  "sweep",
  "light-rays",
  "curved-rays",
  "star-field",
  "orbit-trails",
  "warp-field",
  "nebula",
  "aurora",
  "neon-waves",
  "hex-tiles",
  "deep-field",
  "floating-panels",
  "pleiades",
];

const VARIANTS: ScenarioVariant[] = [
  "frames",
  "context-events",
  "no-context",
  "compile-fail",
  "link-fail",
];

const summarize = (log: string[]): string => `${log.length} ${sha256(log.join("\n")).slice(0, 16)}`;

describe("canvas layer draw-call recording", () => {
  it("covers every registered layer", () => {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { layerRegistry } = require("./registry");
    expect(Object.keys(layerRegistry).sort()).toEqual([...LAYER_NAMES].sort());
    jest.restoreAllMocks();
  });

  it.each(LAYER_NAMES)("%s keeps its recorded draw calls", (layerName) => {
    const summaries: Record<string, string> = {};
    Object.entries(PARAM_SETS).forEach(([paramSetName, params]) => {
      VARIANTS.forEach((variant) => {
        const first = runScenario(layerName, params, variant);
        const second = runScenario(layerName, params, variant);
        expect(second).toEqual(first);
        const key = `${paramSetName}/${variant}`;
        summaries[key] = summarize(first);
      });
    });
    expect(summaries).toMatchSnapshot();
  });
});
