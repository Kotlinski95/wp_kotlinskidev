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
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;

const float noiseIntensity = 2.8;
const float noiseDefinition = 0.6;
const vec2 glowPos = vec2(-2.0, 0.0);

const float total = 60.0;
const float minSize = 0.03;
const float maxSize = 0.08 - minSize;
const float yDistribution = 0.5;

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(in vec2 p) {
  p *= noiseIntensity;
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
    mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y
  );
}

float fbm(in vec2 uv) {
  uv *= 5.0;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float f = 0.5000 * noise(uv); uv = m * uv;
  f += 0.2500 * noise(uv); uv = m * uv;
  f += 0.1250 * noise(uv); uv = m * uv;
  f += 0.0625 * noise(uv); uv = m * uv;
  return 0.5 + 0.5 * f;
}

vec3 bg(vec2 uv, float t) {
  float velocity = t / 1.6;
  float intensity = sin(uv.x * 3.0 + velocity * 2.0) * 1.1 + 1.5;
  uv.y -= 2.0;
  vec2 bp = uv + glowPos;
  uv *= noiseDefinition;

  float rb = fbm(vec2(uv.x * 0.5 - velocity * 0.03, uv.y)) * 0.1;
  uv += rb;

  float rz = fbm(uv * 0.9 + vec2(velocity * 0.35, 0.0));
  rz *= dot(bp * intensity, bp) + 1.2;

  vec3 col = u_colorStart / (0.1 - rz);
  return sqrt(abs(col));
}

float rectangle(vec2 uv, vec2 pos, float width, float height, float blur) {
  vec2 d = (vec2(width, height) + 0.01) / 2.0 - abs(uv - pos);
  d = smoothstep(0.0, blur, d);
  return d.x * d.y;
}

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
  float t = u_time * 0.001 * u_speed;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 color = bg(uv, t) * (2.0 - abs(uv.y * 2.0));

  float velX = -t / 8.0;
  float velY = t / 10.0;

  for (int i = 0; i < 60; i++) {
    float index = float(i) / total;
    float rnd = random(vec2(index));

    vec2 pos = vec2(0.0);
    pos.x = fract(velX * rnd + index) * 4.0 - 2.0;
    pos.y = sin(index * rnd * 1000.0 + velY) * yDistribution;
    float size = maxSize * rnd + minSize;

    vec2 uvRot = uv - pos + size / 2.0;
    uvRot = rotate2d(float(i) + t / 2.0) * uvRot;
    uvRot += pos + size / 2.0;

    float rect = rectangle(uvRot, pos, size, size, (maxSize + minSize - size) / 2.0);
    color += u_colorEnd * rect * size / maxSize;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

interface FloatingPanelsUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  colorStart: WebGLUniformLocation;
  colorEnd: WebGLUniformLocation;
}

interface FloatingPanelsGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: FloatingPanelsUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): FloatingPanelsUniforms | null => {
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
  const colorStart = gl.getUniformLocation(program, "u_colorStart");
  const colorEnd = gl.getUniformLocation(program, "u_colorEnd");
  if (!resolution || !time || !speed || !colorStart || !colorEnd) {
    return null;
  }

  return { resolution, time, speed, colorStart, colorEnd };
};

const createFloatingPanelsGL = (): FloatingPanelsGL | null => {
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

  const state: FloatingPanelsGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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

  const existing = cache.floatingPanelsGL as FloatingPanelsGL | null | undefined;
  const state = existing !== undefined ? existing : createFloatingPanelsGL();
  cache.floatingPanelsGL = state;
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
  const [startR, startG, startB] = parseColorToRgb01(
    resolveColor(String(params.colorStart ?? "#03296b"))
  );
  const [endR, endG, endB] = parseColorToRgb01(resolveColor(String(params.colorEnd ?? "#034291")));

  const { gl, uniforms } = state;
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform1f(uniforms.time, time);
  gl.uniform1f(uniforms.speed, speed);
  gl.uniform3f(uniforms.colorStart, startR, startG, startB);
  gl.uniform3f(uniforms.colorEnd, endR, endG, endB);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
