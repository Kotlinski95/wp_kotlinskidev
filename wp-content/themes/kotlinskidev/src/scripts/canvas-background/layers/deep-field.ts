import type { CanvasLayerDraw } from "../types";
import { parseColorToRgb01 } from "../color";

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

vec3 saturate3(vec3 c) {
  return clamp(c, 0.0, 1.0);
}

float saturate1(float f) {
  return clamp(f, 0.0, 1.0);
}

vec2 grad(vec2 z) {
  float n = dot(z, vec2(127.1, 311.7));
  float h = fract(sin(n) * 43758.5453123);
  float angle = h * 6.283185307179586;
  return vec2(cos(angle), sin(angle));
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(dot(grad(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y
  );
}

vec3 starsColor(vec2 uv, float seed) {
  float threshold = 0.6;
  float n = noise(uv + vec2(seed, seed)) * 1.25;
  vec3 col = vec3(n) - threshold;
  col *= 1.0 / (1.0 - threshold);
  return saturate3(col);
}

vec2 starsUv(vec2 screenUv, vec2 resolution, float scale) {
  vec2 uv = screenUv - vec2(0.5);
  uv *= resolution * 0.25;
  uv /= scale;
  return uv;
}

float starFade(float age, float cycleLen, float fadeTime) {
  float fadeOut = 1.0 - smoothstep(cycleLen - fadeTime, cycleLen, age);
  float fadeIn = smoothstep(0.0, fadeTime, age);
  return fadeIn * fadeOut;
}

vec3 starFieldOctave(
  float startAge,
  vec2 screenUv,
  vec2 resolution,
  float globalTime,
  float seed,
  float cycleLen,
  float fadeTime,
  float maxScalePow,
  float maxScale
) {
  float cycleTime = mod(globalTime + startAge, cycleLen);
  float t = cycleTime / cycleLen;

  float fade = starFade(cycleTime, cycleLen, fadeTime);
  float scale = 1.0 + pow(t, maxScalePow) * maxScale;

  fade = (startAge < 0.0) ? 1.0 : fade;
  scale = (startAge < 0.0) ? 1.0 : scale;

  vec2 uv = starsUv(screenUv, resolution, scale);
  return fade * starsColor(uv, seed);
}

float starShimmer(vec2 screenUv, float rawTime) {
  float shimmerSpeed = rawTime * 2.0;
  float octaveA = abs(noise(vec2(23.0, 19.0) * screenUv + vec2(shimmerSpeed)));
  float octaveB = abs(noise(vec2(27.0, -29.0) * screenUv + vec2(shimmerSpeed)));
  return 0.5 + 0.5 * saturate1(octaveA + octaveB);
}

vec2 rotate2d(vec2 v, float r) {
  float cosR = cos(r);
  float sinR = sin(r);
  mat2 m = mat2(cosR, -sinR, sinR, cosR);
  return v * m;
}

vec4 nebulaField(vec2 screenUv, float globalTime) {
  vec2 uv = screenUv;

  float rotAmount = 0.2;
  vec2 uvR = rotate2d(uv, globalTime * 0.0125 * rotAmount);
  vec2 uvG = rotate2d(uv, globalTime * -0.00625 * rotAmount);
  vec2 uvB = uv;

  uvR += vec2(-1.0, 1.0) * (globalTime * 0.05 * rotAmount);
  uvG += vec2(1.0, 1.0) * (globalTime * 0.03 * rotAmount);
  uvB += vec2(1.0, -1.0) * (globalTime * 0.01 * rotAmount);

  vec4 neb = vec4(0.0);

  float r = 1.3 * noise(vec2(192.0) + uvR * 3.2)
          + 0.5 * noise(vec2(1123.0) + uvR * 5.7)
          + 0.1 * noise(vec2(173.0) + uvR * 125.7);

  float g = 1.1 * noise(vec2(17.0) + uvG * 2.3)
          + 0.6 * noise(vec2(41.0) + uvR * 5.2)
          + 0.1 * noise(vec2(137.0) + uvG * 65.7);

  neb.r = saturate1(r * 0.5);
  neb.g = saturate1(g * 0.5);

  neb.b = 1.0 * noise(vec2(179.0) + uvB * 3.2)
        + 0.1 * noise(vec2(342.0) + uvB * 45.0);
  neb.b = saturate1(2.0 * (neb.r + 0.8 * neb.g) * neb.b);

  neb.g += 0.1 * neb.b;
  neb.r += 0.2 * neb.b;
  neb.r += 0.2 * neb.g;

  neb.a = 0.1 * neb.r + 0.2 * neb.g + 0.1 * neb.b;
  neb.a += saturate1(0.25 + 0.75 * noise(vec2(457.0) + uv * 3.12));

  return neb;
}

void main() {
  const float cycleLen = 20.0;
  const float fadeTime = 7.0;
  const float maxScalePow = 3.0;

  vec2 screenUv = gl_FragCoord.xy / u_resolution;
  float rawTime = u_time * 0.001;
  float globalTime = rawTime * u_speed;
  float maxScale = u_intensity;
  float ageOffset = cycleLen * 0.25;

  float shimmer = starShimmer(screenUv, rawTime);
  vec4 neb = nebulaField(screenUv, globalTime);

  vec3 col = 0.2 * neb.rgb
    + neb.a * starFieldOctave(-1.0, screenUv, u_resolution, globalTime, 265.0, cycleLen, fadeTime, maxScalePow, maxScale) * shimmer;

  vec3 starsCol = starFieldOctave(0.0 * ageOffset, screenUv, u_resolution, globalTime, 42.0, cycleLen, fadeTime, maxScalePow, maxScale)
    + starFieldOctave(1.0 * ageOffset, screenUv, u_resolution, globalTime, 93.0, cycleLen, fadeTime, maxScalePow, maxScale)
    + starFieldOctave(2.0 * ageOffset, screenUv, u_resolution, globalTime, 137.0, cycleLen, fadeTime, maxScalePow, maxScale)
    + starFieldOctave(3.0 * ageOffset, screenUv, u_resolution, globalTime, 17.0, cycleLen, fadeTime, maxScalePow, maxScale);
  starsCol *= shimmer;

  col += starsCol;
  col *= u_color;

  gl_FragColor = vec4(col, 1.0);
}
`;

interface DeepFieldUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  intensity: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface DeepFieldGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: DeepFieldUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): DeepFieldUniforms | null => {
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

const createDeepFieldGL = (): DeepFieldGL | null => {
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

  const state: DeepFieldGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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
  const opacity = Number(params.opacity ?? 1);
  if (opacity <= 0) {
    return;
  }

  const existing = cache.deepFieldGL as DeepFieldGL | null | undefined;
  const state = existing !== undefined ? existing : createDeepFieldGL();
  cache.deepFieldGL = state;
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

  const speed = Number(params.speed ?? 1);
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
