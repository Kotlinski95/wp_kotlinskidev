import { getWebGlContext, linkProgram, onContextLost, onContextRestored } from "../shader-program";
import {
  ORBIT_TRAILS_MAIN_FRAGMENT_SHADER,
  ORBIT_TRAILS_OUTPUT_FRAGMENT_SHADER,
  ORBIT_TRAILS_VERTEX_SHADER,
} from "./shaders/orbit-trails-shaders";

interface OrbitTrailsUniforms {
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  decay: WebGLUniformLocation;
  color: WebGLUniformLocation;
  previousFrame: WebGLUniformLocation;
}

interface OutputUniforms {
  frame: WebGLUniformLocation;
}

export interface RenderTarget {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

interface OrbitTrailsPrograms {
  mainProgram: WebGLProgram;
  outputProgram: WebGLProgram;
  mainUniforms: OrbitTrailsUniforms;
  outputUniforms: OutputUniforms;
  positionBuffer: WebGLBuffer;
  mainPositionLocation: number;
  outputPositionLocation: number;
}

export interface OrbitTrailsGL extends OrbitTrailsPrograms {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  current: RenderTarget;
  previous: RenderTarget;
  width: number;
  height: number;
  lost: boolean;
}

interface RenderTargetPair {
  current: RenderTarget;
  previous: RenderTarget;
}

const createRenderTarget = (
  gl: WebGLRenderingContext,
  width: number,
  height: number
): RenderTarget | null => {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) {
    return null;
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return { texture, framebuffer };
};

export const createRenderTargetPair = (
  gl: WebGLRenderingContext,
  width: number,
  height: number
): RenderTargetPair | null => {
  const current = createRenderTarget(gl, width, height);
  const previous = createRenderTarget(gl, width, height);
  if (!current || !previous) {
    return null;
  }
  return { current, previous };
};

export const deleteRenderTarget = (gl: WebGLRenderingContext, target: RenderTarget): void => {
  gl.deleteTexture(target.texture);
  gl.deleteFramebuffer(target.framebuffer);
};

const lookUpMainUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
): OrbitTrailsUniforms | null => {
  const time = gl.getUniformLocation(program, "u_time");
  const speed = gl.getUniformLocation(program, "u_speed");
  const decay = gl.getUniformLocation(program, "u_decay");
  const color = gl.getUniformLocation(program, "u_color");
  const previousFrame = gl.getUniformLocation(program, "u_previousFrame");
  if (!time || !speed || !decay || !color || !previousFrame) {
    return null;
  }
  return { time, speed, decay, color, previousFrame };
};

const FULLSCREEN_QUAD_CORNERS = [-1, -1, 1, -1, -1, 1, 1, 1];

const setupPrograms = (gl: WebGLRenderingContext): OrbitTrailsPrograms | null => {
  const mainProgram = linkProgram(
    gl,
    ORBIT_TRAILS_VERTEX_SHADER,
    ORBIT_TRAILS_MAIN_FRAGMENT_SHADER
  );
  const outputProgram = linkProgram(
    gl,
    ORBIT_TRAILS_VERTEX_SHADER,
    ORBIT_TRAILS_OUTPUT_FRAGMENT_SHADER
  );
  if (!mainProgram || !outputProgram) {
    return null;
  }

  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD_CORNERS), gl.STATIC_DRAW);

  gl.useProgram(mainProgram);
  const mainUniforms = lookUpMainUniforms(gl, mainProgram);
  if (!mainUniforms) {
    return null;
  }

  gl.useProgram(outputProgram);
  const frame = gl.getUniformLocation(outputProgram, "u_frame");
  if (!frame) {
    return null;
  }

  const mainPositionLocation = gl.getAttribLocation(mainProgram, "a_position");
  const outputPositionLocation = gl.getAttribLocation(outputProgram, "a_position");

  return {
    mainProgram,
    outputProgram,
    mainUniforms,
    outputUniforms: { frame },
    positionBuffer,
    mainPositionLocation,
    outputPositionLocation,
  };
};

const restoreAfterContextLoss = (state: OrbitTrailsGL): void => {
  const restoredPrograms = setupPrograms(state.gl);
  if (!restoredPrograms) {
    return;
  }
  const restoredTargets = createRenderTargetPair(
    state.gl,
    Math.max(1, state.width),
    Math.max(1, state.height)
  );
  if (!restoredTargets) {
    return;
  }
  Object.assign(state, restoredPrograms);
  state.current = restoredTargets.current;
  state.previous = restoredTargets.previous;
  state.width = 0;
  state.height = 0;
  state.lost = false;
};

export const createOrbitTrailsGL = (): OrbitTrailsGL | null => {
  const canvas = document.createElement("canvas");
  const gl = getWebGlContext(canvas);
  if (!gl) {
    return null;
  }

  const programs = setupPrograms(gl);
  if (!programs) {
    return null;
  }

  const targets = createRenderTargetPair(gl, 1, 1);
  if (!targets) {
    return null;
  }

  const state: OrbitTrailsGL = {
    canvas,
    gl,
    ...programs,
    current: targets.current,
    previous: targets.previous,
    width: 0,
    height: 0,
    lost: false,
  };

  onContextLost(canvas, () => {
    state.lost = true;
  });
  onContextRestored(canvas, () => restoreAfterContextLoss(state));

  return state;
};
