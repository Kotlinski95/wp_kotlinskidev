import type { CanvasLayerDraw } from "../types";
import { drawFullscreenQuad } from "../shader-program";
import { readColorParam, readNumberParam } from "../shader-layer";
import {
  createOrbitTrailsGL,
  createRenderTargetPair,
  deleteRenderTarget,
  type OrbitTrailsGL,
} from "./orbit-trails-gl";

const POSITION_COMPONENTS = 2;

const resizeRenderTargets = (state: OrbitTrailsGL, width: number, height: number): boolean => {
  if (state.width === width && state.height === height) {
    return true;
  }
  const { gl } = state;
  const targets = createRenderTargetPair(gl, width, height);
  if (!targets) {
    return false;
  }
  deleteRenderTarget(gl, state.current);
  deleteRenderTarget(gl, state.previous);
  state.canvas.width = width;
  state.canvas.height = height;
  state.current = targets.current;
  state.previous = targets.previous;
  state.width = width;
  state.height = height;
  return true;
};

const bindQuadPositions = (
  gl: WebGLRenderingContext,
  buffer: WebGLBuffer,
  positionLocation: number
): void => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, POSITION_COMPONENTS, gl.FLOAT, false, 0, 0);
};

interface TrailFrameValues {
  time: number;
  speed: number;
  decay: number;
  color: [number, number, number];
}

const renderTrailPass = (
  state: OrbitTrailsGL,
  size: { width: number; height: number },
  values: TrailFrameValues
): void => {
  const { gl } = state;
  gl.bindFramebuffer(gl.FRAMEBUFFER, state.current.framebuffer);
  gl.viewport(0, 0, size.width, size.height);
  gl.useProgram(state.mainProgram);
  bindQuadPositions(gl, state.positionBuffer, state.mainPositionLocation);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.previous.texture);
  gl.uniform1i(state.mainUniforms.previousFrame, 0);
  gl.uniform1f(state.mainUniforms.time, values.time);
  gl.uniform1f(state.mainUniforms.speed, values.speed);
  gl.uniform1f(state.mainUniforms.decay, values.decay);
  gl.uniform3f(state.mainUniforms.color, ...values.color);
  drawFullscreenQuad(gl);
};

const renderOutputPass = (state: OrbitTrailsGL, size: { width: number; height: number }): void => {
  const { gl } = state;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, size.width, size.height);
  gl.useProgram(state.outputProgram);
  bindQuadPositions(gl, state.positionBuffer, state.outputPositionLocation);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.current.texture);
  gl.uniform1i(state.outputUniforms.frame, 0);
  drawFullscreenQuad(gl);
};

const swapRenderTargets = (state: OrbitTrailsGL): void => {
  const swap = state.previous;
  state.previous = state.current;
  state.current = swap;
};

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor, cache }) => {
  const opacity = readNumberParam(params, "opacity", 1);
  if (opacity <= 0) {
    return;
  }

  const existing = cache.orbitTrailsGL as OrbitTrailsGL | null | undefined;
  const state = existing !== undefined ? existing : createOrbitTrailsGL();
  cache.orbitTrailsGL = state;
  if (!state || state.lost) {
    return;
  }

  if (!resizeRenderTargets(state, width, height)) {
    return;
  }

  const values: TrailFrameValues = {
    time,
    speed: readNumberParam(params, "speed", 1),
    decay: readNumberParam(params, "decay", 0.986),
    color: readColorParam(params, "color", "#ffffff", resolveColor),
  };

  renderTrailPass(state, { width, height }, values);
  renderOutputPass(state, { width, height });
  swapRenderTargets(state);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
