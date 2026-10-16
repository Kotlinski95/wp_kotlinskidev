import type { CanvasLayerDraw } from "../types";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_intensity;
uniform vec3 u_color;

const float scaleX = 2.0;
const float scaleY = 2.0;
const float roundness = 1.0;
const int iterLimit = 10;

const vec3 tone1 = vec3(0.369, 0.369, 0.369);
const vec3 tone2 = vec3(0.749, 0.749, 0.749);
const vec3 tone3 = vec3(0.851, 0.851, 0.851);

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 I = gl_FragCoord.xy;
  float t = u_time * 0.001 * u_speed;

  float z = 0.0;
  float d = 0.0;
  vec4 O = vec4(0.0);

  for (int i = 0; i < iterLimit; i++) {
    vec3 p = z * normalize(vec3(I + I, 0.0) - u_resolution.xyy);

    p.x += sin(p.x + t * 0.5) + cos(p.y + t * 0.3);
    p.y += cos(p.x - t * 0.4) + sin(p.y + t * 0.6);
    p.z += sin(t * 0.2) * 1.5;

    p.x *= scaleX;
    p.y *= scaleY;

    vec3 v = cos(p) - sin(p).yzx;
    vec3 shape = mix(max(v, v.yzx * 0.2), v, roundness);

    d = 1e-4 + 0.5 * length(shape);
    z += d;

    vec3 weights = abs(cos(p));
    weights /= dot(weights, vec3(1.0));

    vec3 blended = tone1 * weights.x + tone2 * weights.y + tone3 * weights.z;
    O.rgb += (blended * u_intensity) / d;
  }

  O /= O + 300.0;

  float luminance = dot(O.rgb, vec3(0.299, 0.587, 0.114));
  O.rgb = mix(vec3(luminance), O.rgb, 1.6);

  O.rgb += (random(I) - 0.5) / 128.0;
  O.rgb *= u_color;

  gl_FragColor = vec4(O.rgb, 1.0);
}
`;

interface NeonWavesUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  intensity: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface NeonWavesGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: NeonWavesUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): NeonWavesUniforms | null => {
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
  const speed = gl.getUniformLocation(program, "u_speed");
  const intensity = gl.getUniformLocation(program, "u_intensity");
  const color = gl.getUniformLocation(program, "u_color");
  if (!resolution || !time || !speed || !intensity || !color) {
    return null;
  }

  return { resolution, time, speed, intensity, color };
};

const createNeonWavesGL = (): NeonWavesGL | null => {
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

  const state: NeonWavesGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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

  const existing = cache.neonWavesGL as NeonWavesGL | null | undefined;
  const state = existing !== undefined ? existing : createNeonWavesGL();
  cache.neonWavesGL = state;
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

  const speed = Number(params.speed ?? 0.6);
  const intensity = Number(params.intensity ?? 3);
  const [r, g, b] = parseColorToRgb01(resolveColor(String(params.color ?? "#ffffff")));

  const { gl, uniforms } = state;
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform1f(uniforms.time, time);
  gl.uniform1f(uniforms.speed, speed);
  gl.uniform1f(uniforms.intensity, intensity);
  gl.uniform3f(uniforms.color, r, g, b);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
