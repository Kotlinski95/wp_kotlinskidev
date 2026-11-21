import type { CanvasLayerDraw, CanvasLayerParams } from "./types";
import { parseColorToRgb01 } from "./color";
import {
  FULLSCREEN_VERTEX_SHADER,
  bindPositionAttribute,
  drawFullscreenQuad,
  getWebGlContext,
  linkProgram,
  onContextLost,
  onContextRestored,
  uploadFullscreenQuad,
} from "./shader-program";

export type Rgb01 = [number, number, number];
export type ResolveColor = (value: string) => string;

type UniformLocations<ExtraUniform extends string> = Record<
  "resolution" | "time" | ExtraUniform,
  WebGLUniformLocation
>;

interface ShaderLayerState<ExtraUniform extends string> {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: UniformLocations<ExtraUniform>;
  width: number;
  height: number;
  lost: boolean;
}

export interface ShaderLayerSpec<ExtraUniform extends string, FrameValues> {
  cacheKey: string;
  fragmentShader: string;
  extraUniforms: readonly ExtraUniform[];
  defaultOpacity: number;
  enableAlphaBlending?: boolean;
  readFrameValues: (params: CanvasLayerParams, resolveColor: ResolveColor) => FrameValues;
  applyUniforms: (
    gl: WebGLRenderingContext,
    uniforms: UniformLocations<ExtraUniform>,
    values: FrameValues
  ) => void;
}

export const readNumberParam = (params: CanvasLayerParams, key: string, fallback: number): number =>
  Number(params[key] ?? fallback);

export const readColorParam = (
  params: CanvasLayerParams,
  key: string,
  fallback: string,
  resolveColor: ResolveColor
): Rgb01 => parseColorToRgb01(resolveColor(String(params[key] ?? fallback)));

const setupProgram = <ExtraUniform extends string, FrameValues>(
  gl: WebGLRenderingContext,
  spec: ShaderLayerSpec<ExtraUniform, FrameValues>
): UniformLocations<ExtraUniform> | null => {
  const program = linkProgram(gl, FULLSCREEN_VERTEX_SHADER, spec.fragmentShader);
  if (!program) {
    return null;
  }
  gl.useProgram(program);

  uploadFullscreenQuad(gl);
  bindPositionAttribute(gl, program);

  const names = ["resolution", "time", ...spec.extraUniforms];
  const locations = names.map((name) => gl.getUniformLocation(program, `u_${name}`));
  if (!locations.every(Boolean)) {
    return null;
  }

  if (spec.enableAlphaBlending) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  return Object.fromEntries(
    names.map((name, index) => [name, locations[index]])
  ) as UniformLocations<ExtraUniform>;
};

const createLayerState = <ExtraUniform extends string, FrameValues>(
  spec: ShaderLayerSpec<ExtraUniform, FrameValues>
): ShaderLayerState<ExtraUniform> | null => {
  const canvas = document.createElement("canvas");
  const gl = getWebGlContext(canvas);
  if (!gl) {
    return null;
  }

  const uniforms = setupProgram(gl, spec);
  if (!uniforms) {
    return null;
  }

  const state: ShaderLayerState<ExtraUniform> = {
    canvas,
    gl,
    uniforms,
    width: 0,
    height: 0,
    lost: false,
  };

  onContextLost(canvas, () => {
    state.lost = true;
  });

  onContextRestored(canvas, () => {
    const restoredUniforms = setupProgram(gl, spec);
    if (!restoredUniforms) {
      return;
    }
    state.uniforms = restoredUniforms;
    state.width = 0;
    state.height = 0;
    state.lost = false;
  });

  return state;
};

const resizeState = <ExtraUniform extends string>(
  state: ShaderLayerState<ExtraUniform>,
  width: number,
  height: number
): void => {
  if (state.width === width && state.height === height) {
    return;
  }
  state.canvas.width = width;
  state.canvas.height = height;
  state.width = width;
  state.height = height;
  state.gl.viewport(0, 0, width, height);
};

export const createShaderLayer = <ExtraUniform extends string, FrameValues>(
  spec: ShaderLayerSpec<ExtraUniform, FrameValues>
): CanvasLayerDraw => {
  return (ctx, { width, height, time, params, resolveColor, cache }) => {
    const opacity = readNumberParam(params, "opacity", spec.defaultOpacity);
    if (opacity <= 0) {
      return;
    }

    const existing = cache[spec.cacheKey] as ShaderLayerState<ExtraUniform> | null | undefined;
    const state = existing !== undefined ? existing : createLayerState(spec);
    cache[spec.cacheKey] = state;
    if (!state || state.lost) {
      return;
    }

    resizeState(state, width, height);

    const values = spec.readFrameValues(params, resolveColor);

    const { gl, uniforms } = state;
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.time, time);
    spec.applyUniforms(gl, uniforms, values);
    drawFullscreenQuad(gl);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = opacity;
    ctx.drawImage(state.canvas, 0, 0, width, height);
    ctx.restore();
  };
};
