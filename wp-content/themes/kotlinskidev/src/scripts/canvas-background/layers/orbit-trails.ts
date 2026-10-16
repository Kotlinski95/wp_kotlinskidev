import type { CanvasLayerDraw } from "../types";

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const MAIN_FRAGMENT_SHADER = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform float u_speed;
uniform float u_decay;
uniform vec3 u_color;
uniform sampler2D u_previousFrame;

float sdf(vec2 uv, float t) {
  float screenBorder = length(uv - 0.5 + vec2(sin(t * 3.0) * 0.5, cos(t * 3.0) * 0.5)) * 3.0;
  float orbit = distance(
    uv - 0.5,
    vec2(sin(t * 3.0) * 0.2 + cos(t * 3.0) * 0.1 * sin(t * t), cos(t * 3.0) * 0.2)
  ) * 8.0;
  return min(screenBorder, orbit);
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.001 * u_speed;

  float glow = smoothstep(0.0, 15.0, 1.0 - sdf(uv, t));
  vec4 tint = vec4(u_color, 1.0) * (vec4(sin(t * 2.0), cos(t * 2.0), 0.0, 0.0) + 2.3);
  vec4 trail = texture2D(u_previousFrame, uv) * u_decay;

  gl_FragColor = vec4(glow) * tint + trail;
}
`;

const OUTPUT_FRAGMENT_SHADER = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_frame;
void main() {
  gl_FragColor = texture2D(u_frame, v_uv);
}
`;

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

interface RenderTarget {
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

interface OrbitTrailsGL extends OrbitTrailsPrograms {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  current: RenderTarget;
  previous: RenderTarget;
  width: number;
  height: number;
  lost: boolean;
}

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const linkProgram = (
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram | null => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return null;
  }
  return program;
};

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

const resizeTargets = (
  gl: WebGLRenderingContext,
  width: number,
  height: number
): { current: RenderTarget; previous: RenderTarget } | null => {
  const current = createRenderTarget(gl, width, height);
  const previous = createRenderTarget(gl, width, height);
  if (!current || !previous) {
    return null;
  }
  return { current, previous };
};

const setupProgram = (gl: WebGLRenderingContext): OrbitTrailsPrograms | null => {
  const mainProgram = linkProgram(gl, VERTEX_SHADER, MAIN_FRAGMENT_SHADER);
  const outputProgram = linkProgram(gl, VERTEX_SHADER, OUTPUT_FRAGMENT_SHADER);
  if (!mainProgram || !outputProgram) {
    return null;
  }

  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  gl.useProgram(mainProgram);
  const time = gl.getUniformLocation(mainProgram, "u_time");
  const speed = gl.getUniformLocation(mainProgram, "u_speed");
  const decay = gl.getUniformLocation(mainProgram, "u_decay");
  const color = gl.getUniformLocation(mainProgram, "u_color");
  const previousFrame = gl.getUniformLocation(mainProgram, "u_previousFrame");
  if (!time || !speed || !decay || !color || !previousFrame) {
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
    mainUniforms: { time, speed, decay, color, previousFrame },
    outputUniforms: { frame },
    positionBuffer,
    mainPositionLocation,
    outputPositionLocation,
  };
};

const createOrbitTrailsGL = (): OrbitTrailsGL | null => {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") ??
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
  if (!gl) {
    return null;
  }

  const programs = setupProgram(gl);
  if (!programs) {
    return null;
  }

  const targets = resizeTargets(gl, 1, 1);
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

  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
      state.lost = true;
    },
    false
  );

  canvas.addEventListener(
    "webglcontextrestored",
    () => {
      const restoredPrograms = setupProgram(gl);
      if (!restoredPrograms) {
        return;
      }
      const restoredTargets = resizeTargets(
        gl,
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
    },
    false
  );

  return state;
};

const colorProbe = document.createElement("canvas");
colorProbe.width = 1;
colorProbe.height = 1;
const colorProbeCtx = colorProbe.getContext("2d");

const parseColorToRgb01 = (cssColor: string): [number, number, number] => {
  if (!colorProbeCtx) {
    return [1, 1, 1];
  }
  colorProbeCtx.clearRect(0, 0, 1, 1);
  colorProbeCtx.fillStyle = cssColor;
  colorProbeCtx.fillRect(0, 0, 1, 1);
  const [r, g, b] = colorProbeCtx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
};

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor, cache }) => {
  const opacity = Number(params.opacity ?? 1);
  if (opacity <= 0) {
    return;
  }

  const existing = cache.orbitTrailsGL as OrbitTrailsGL | null | undefined;
  const state = existing !== undefined ? existing : createOrbitTrailsGL();
  cache.orbitTrailsGL = state;
  if (!state || state.lost) {
    return;
  }

  const { gl } = state;

  if (state.width !== width || state.height !== height) {
    const targets = resizeTargets(gl, width, height);
    if (!targets) {
      return;
    }
    gl.deleteTexture(state.current.texture);
    gl.deleteFramebuffer(state.current.framebuffer);
    gl.deleteTexture(state.previous.texture);
    gl.deleteFramebuffer(state.previous.framebuffer);
    state.canvas.width = width;
    state.canvas.height = height;
    state.current = targets.current;
    state.previous = targets.previous;
    state.width = width;
    state.height = height;
  }

  const speed = Number(params.speed ?? 1);
  const decay = Number(params.decay ?? 0.986);
  const [r, g, b] = parseColorToRgb01(resolveColor(String(params.color ?? "#ffffff")));

  gl.bindFramebuffer(gl.FRAMEBUFFER, state.current.framebuffer);
  gl.viewport(0, 0, width, height);
  gl.useProgram(state.mainProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, state.positionBuffer);
  gl.enableVertexAttribArray(state.mainPositionLocation);
  gl.vertexAttribPointer(state.mainPositionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.previous.texture);
  gl.uniform1i(state.mainUniforms.previousFrame, 0);
  gl.uniform1f(state.mainUniforms.time, time);
  gl.uniform1f(state.mainUniforms.speed, speed);
  gl.uniform1f(state.mainUniforms.decay, decay);
  gl.uniform3f(state.mainUniforms.color, r, g, b);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, width, height);
  gl.useProgram(state.outputProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, state.positionBuffer);
  gl.enableVertexAttribArray(state.outputPositionLocation);
  gl.vertexAttribPointer(state.outputPositionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.current.texture);
  gl.uniform1i(state.outputUniforms.frame, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const swap = state.previous;
  state.previous = state.current;
  state.current = swap;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
