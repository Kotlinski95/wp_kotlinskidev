import type { CanvasLayerDraw } from "../types";
import { parseColorToRgb01 } from "../color";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_rayCount;
uniform float u_speed;
uniform vec3 u_color;

float rayGlow(vec2 origin, vec2 direction, vec2 coord, float freqA, float freqB, float timeSeconds, float raySpeed) {
  vec2 toOrigin = coord - origin;
  float cosAngle = dot(normalize(toOrigin), direction);

  float shimmer =
    (0.45 + 0.15 * sin(cosAngle * freqA + timeSeconds * raySpeed)) +
    (0.3 + 0.2 * cos(-cosAngle * freqB + timeSeconds * raySpeed));

  float reach = clamp((u_resolution.x - length(toOrigin)) / u_resolution.x, 0.5, 1.0);

  return clamp(shimmer, 0.0, 1.0) * reach;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  float timeSeconds = u_time * 0.001;
  float freqScale = u_rayCount / 8.0;

  vec2 originA = vec2(u_resolution.x * 0.7, u_resolution.y * -0.4);
  vec2 directionA = normalize(vec2(1.0, -0.116));
  float glowA = rayGlow(
    originA,
    directionA,
    coord,
    36.2214 * freqScale,
    21.11349 * freqScale,
    timeSeconds,
    1.5 * u_speed
  );

  vec2 originB = vec2(u_resolution.x * 0.8, u_resolution.y * -0.6);
  vec2 directionB = normalize(vec2(1.0, 0.241));
  float glowB = rayGlow(
    originB,
    directionB,
    coord,
    22.3991 * freqScale,
    18.0234 * freqScale,
    timeSeconds,
    1.1 * u_speed
  );

  vec3 color = u_color * (glowA * 0.5 + glowB * 0.4);

  float brightness = 1.0 - (coord.y / u_resolution.y);
  color *= 0.1 + brightness * 0.9;

  gl_FragColor = vec4(color, 1.0);
}
`;

interface LightRaysUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  rayCount: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface LightRaysGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: LightRaysUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): LightRaysUniforms | null => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
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
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, "u_resolution");
  const time = gl.getUniformLocation(program, "u_time");
  const rayCount = gl.getUniformLocation(program, "u_rayCount");
  const speed = gl.getUniformLocation(program, "u_speed");
  const color = gl.getUniformLocation(program, "u_color");
  if (!resolution || !time || !rayCount || !speed || !color) {
    return null;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return { resolution, time, rayCount, speed, color };
};

const createLightRaysGL = (): LightRaysGL | null => {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") ??
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
  if (!gl) {
    return null;
  }

  const uniforms = setupProgram(gl);
  if (!uniforms) {
    return null;
  }

  const state: LightRaysGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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
      const restoredUniforms = setupProgram(gl);
      if (!restoredUniforms) {
        return;
      }
      state.uniforms = restoredUniforms;
      state.width = 0;
      state.height = 0;
      state.lost = false;
    },
    false
  );

  return state;
};

const draw: CanvasLayerDraw = (ctx, { width, height, time, params, resolveColor, cache }) => {
  const opacity = Number(params.opacity ?? 0.5);
  if (opacity <= 0) {
    return;
  }

  const existing = cache.lightRaysGL as LightRaysGL | null | undefined;
  const state = existing !== undefined ? existing : createLightRaysGL();
  cache.lightRaysGL = state;
  if (!state || state.lost) {
    return;
  }

  if (state.width !== width || state.height !== height) {
    state.canvas.width = width;
    state.canvas.height = height;
    state.width = width;
    state.height = height;
    state.gl.viewport(0, 0, width, height);
  }

  const rayCount = Math.max(1, Math.round(Number(params.rayCount ?? 8)));
  const speed = Number(params.speed ?? 0.3);
  const [r, g, b] = parseColorToRgb01(resolveColor(String(params.color ?? "#ffffff")));

  const { gl, uniforms } = state;
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform1f(uniforms.time, time);
  gl.uniform1f(uniforms.rayCount, rayCount);
  gl.uniform1f(uniforms.speed, speed);
  gl.uniform3f(uniforms.color, r, g, b);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
