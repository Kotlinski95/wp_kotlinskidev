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

#define BLUEFACTOR 1.5
const int NUM_STARS = 20;

vec3 starPos[20];
float starBright[20];
vec3 starColor[20];

void initStars() {
  starPos[0] = vec3(1.15, -0.05, -0.4);
  starPos[1] = vec3(4.58, -0.62, 2.1);
  starPos[2] = vec3(-4.40, -0.05, -1.9);
  starPos[3] = vec3(-2.42, 2.32, -2.6);
  starPos[4] = vec3(-1.41, -1.58, 5.2);
  starPos[5] = vec3(-3.76, 3.21, -2.5);
  starPos[6] = vec3(4.62, 0.22, 1.9);
  starPos[7] = vec3(-4.56, 1.60, -0.8);
  starPos[8] = vec3(-2.28, 4.01, -4.0);
  starPos[9] = vec3(-1.97, 3.78, -1.5);
  starPos[10] = vec3(-3.82, 6.65, 2.3);
  starPos[11] = vec3(2.85, -6.42, -6.2);
  starPos[12] = vec3(0.74, 0.02, 2.7);
  starPos[13] = vec3(-0.02, 3.71, 1.3);
  starPos[14] = vec3(3.16, 2.12, -4.2);
  starPos[15] = vec3(-3.34, 1.08, 0.5);
  starPos[16] = vec3(3.75, -2.31, 3.8);
  starPos[17] = vec3(-5.70, -0.95, -2.9);
  starPos[18] = vec3(0.60, 1.53, -0.1);
  starPos[19] = vec3(4.38, -3.68, 3.1);

  starBright[0] = 1.000;
  starBright[1] = 0.500;
  starBright[2] = 0.465;
  starBright[3] = 0.398;
  starBright[4] = 0.299;
  starBright[5] = 0.268;
  starBright[6] = 0.129;
  starBright[7] = 0.093;
  starBright[8] = 0.070;
  starBright[9] = 0.037;
  starBright[10] = 0.077;
  starBright[11] = 0.094;
  starBright[12] = 0.043;
  starBright[13] = 0.026;
  starBright[14] = 0.023;
  starBright[15] = 0.047;
  starBright[16] = 0.047;
  starBright[17] = 0.033;
  starBright[18] = 0.035;
  starBright[19] = 0.055;

  starColor[0] = vec3(0.72, 0.82, 1.00);
  starColor[1] = vec3(0.78, 0.86, 1.00);
  starColor[2] = vec3(0.68, 0.80, 1.00);
  starColor[3] = vec3(0.72, 0.82, 1.00);
  starColor[4] = vec3(0.68, 0.80, 1.00);
  starColor[5] = vec3(0.66, 0.78, 1.00);
  starColor[6] = vec3(0.78, 0.86, 1.00);
  starColor[7] = vec3(0.72, 0.82, 1.00);
  starColor[8] = vec3(0.78, 0.86, 1.00);
  starColor[9] = vec3(0.85, 0.90, 1.00);
  starColor[10] = vec3(0.78, 0.86, 1.00);
  starColor[11] = vec3(0.78, 0.86, 1.00);
  starColor[12] = vec3(0.82, 0.88, 1.00);
  starColor[13] = vec3(0.82, 0.88, 1.00);
  starColor[14] = vec3(0.85, 0.90, 1.00);
  starColor[15] = vec3(0.78, 0.86, 1.00);
  starColor[16] = vec3(0.82, 0.88, 1.00);
  starColor[17] = vec3(0.82, 0.88, 1.00);
  starColor[18] = vec3(0.80, 0.85, 1.00);
  starColor[19] = vec3(0.82, 0.88, 1.00);
}

#define CLUSTER_CENTER vec3(0.0, 0.8, 0.0)
#define ORBIT_RADIUS 14.0
#define ORBIT_SPEED 0.48
#define CAMERA_ZOOM 0.75

#define CORE_GAIN 0.150
#define HALO_GAIN 0.020
#define SPIKE_GAIN 0.003
#define SPIKE_LENGTH 400.0

#define NEBULA_STRENGTH 0.35

#define MW_STRENGTH 0.11
#define MW_BAND_WIDTH 18.0
#define MW_DUST_LANE 0.58
#define MW_STAR_DENSITY 0.95
#define MW_STAR_FOCUS 45.0
#define MW_STAR_BRIGHT 0.5

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
const vec3 WORLD_UP = vec3(0.0, 1.0, 0.0);
const vec3 GAL_NORTH = normalize(vec3(0.617, 0.679, 0.399));
const vec3 GAL_CENTER = normalize(vec3(-0.433, -0.130, 0.892));

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

struct Ray {
  vec3 o;
  vec3 d;
};

Ray setupCamera(vec2 uv, vec3 pos, vec3 lookAt, float zoom, vec3 upHint) {
  vec3 fwd = normalize(lookAt - pos);
  vec3 upRef = (abs(dot(fwd, upHint)) > 0.999) ? vec3(0.0, 0.0, 1.0) : upHint;
  vec3 right = normalize(cross(fwd, upRef));
  vec3 up = normalize(cross(right, fwd));
  vec3 img = pos + fwd * zoom + right * uv.x + up * uv.y;
  return Ray(pos, normalize(img - pos));
}

vec3 renderStar(Ray r, vec3 p, float brightness, vec3 color) {
  vec3 op = p - r.o;
  float t = dot(op, r.d);
  if (t < 0.0) {
    return vec3(0.0);
  }

  vec3 closest = r.o + r.d * t - p;
  float d2 = dot(closest, closest);

  float size = 0.08 + 0.35 * sqrt(brightness);
  float s2 = size * size;

  if (d2 > s2 * 800.0) {
    return vec3(0.0);
  }

  float core = CORE_GAIN * brightness / (d2 / s2 + 0.012);
  float halo = HALO_GAIN * brightness / (d2 / (s2 * 15.0) + 0.08);

  vec3 right = normalize(cross(r.d, WORLD_UP));
  vec3 up = normalize(cross(right, r.d));
  float sx = dot(closest, right);
  float sy = dot(closest, up);

  float spikes = 0.0;
  if (brightness > 0.05) {
    float spike1 = max(0.0, 1.0 - abs(sx * sy * SPIKE_LENGTH / s2));
    vec2 rot45 = vec2(sx + sy, sx - sy) * 0.7071;
    float spike2 = max(0.0, 1.0 - abs(rot45.x * rot45.y * SPIKE_LENGTH * 0.6 / s2));
    spikes = (spike1 + spike2 * 0.4) * SPIKE_GAIN * brightness;
    spikes *= smoothstep(size * 25.0, size * 2.0, sqrt(d2));
  }

  return color * (core + halo + spikes);
}

#define DUST_CLOUD_RADIUS 14.0
#define DUST_STEPS 24
#define DUST_STEP_SIZE 0.8
#define NUM_ILLUMINATORS 7

float hash3d(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3d(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3d(i), hash3d(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash3d(i + vec3(0.0, 1.0, 0.0)), hash3d(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash3d(i + vec3(0.0, 0.0, 1.0)), hash3d(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash3d(i + vec3(0.0, 1.0, 1.0)), hash3d(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float dustDensity(vec3 p) {
  float d = 0.01;
  d += noise3d(p * 0.35) * 0.50;
  d += noise3d(p * 0.70 + 3.7) * 0.33;
  d += noise3d(p * 1.50 + 7.1) * 0.22;

  float r = length(p - CLUSTER_CENTER) / DUST_CLOUD_RADIUS;
  d *= smoothstep(1.0, 0.3, r);

  return max(d - 0.25, 0.05);
}

vec3 renderDustNebula(Ray r) {
  vec3 oc = r.o - CLUSTER_CENTER;
  float b = dot(oc, r.d);
  float c = dot(oc, oc) - DUST_CLOUD_RADIUS * DUST_CLOUD_RADIUS;
  float h = b * b - c;
  if (h < 0.0) {
    return vec3(0.0);
  }

  float tNear = max(-b - sqrt(h), 0.0);
  float tFar = -b + sqrt(h);
  if (tFar < 0.0) {
    return vec3(0.0);
  }

  vec3 scatter = vec3(0.0);
  float t = tNear;

  for (int i = 0; i < DUST_STEPS; i++) {
    if (t > tFar) {
      break;
    }
    vec3 pos = r.o + r.d * t;

    float dust = dustDensity(pos);
    if (dust > 0.001) {
      vec3 light = vec3(0.0);
      for (int s = 0; s < NUM_ILLUMINATORS; s++) {
        vec3 toStar = starPos[s] - pos;
        float dist2 = dot(toStar, toStar);
        light += pow(starColor[s], vec3(BLUEFACTOR)) * starBright[s] / (dist2 + 0.5);
      }
      vec3 scattered = light * vec3(0.55, 0.75, 1.00);
      scatter += dust * scattered * DUST_STEP_SIZE;
    }
    t += DUST_STEP_SIZE;
  }

  return scatter * NEBULA_STRENGTH;
}

float noise2d(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm2d(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 drift = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    v += a * noise2d(p);
    p = drift * p * 2.0 + 1.7;
    a *= 0.5;
  }
  return v;
}

vec3 milkyWay(vec3 rd) {
  float sinB = dot(rd, GAL_NORTH);
  float galLat = asin(clamp(sinB, -1.0, 1.0));

  float band = exp(-galLat * galLat * MW_BAND_WIDTH);
  band += 0.6 * exp(-galLat * galLat * MW_BAND_WIDTH * 4.0);

  if (band < 0.005) {
    return vec3(0.0);
  }

  float dustLane = 1.0 - MW_DUST_LANE * exp(-galLat * galLat * MW_BAND_WIDTH * 20.0);

  vec3 inPlane = normalize(rd - sinB * GAL_NORTH);
  vec3 galPerp = normalize(cross(GAL_NORTH, GAL_CENTER));
  float galLon = atan(dot(inPlane, galPerp), dot(inPlane, GAL_CENTER));

  float lonBright = 0.60 + 0.40 * (0.5 + 0.5 * cos(galLon));

  vec2 nCoord = vec2(galLon * 3.0, galLat * 10.0);
  float clouds = fbm2d(nCoord * 2.5 + 42.0);
  float largeClouds = fbm2d(nCoord * 0.8 + 17.0);

  float structure = (0.5 + 0.5 * clouds) * (0.6 + 0.4 * largeClouds);

  float centerFade = exp(-galLat * galLat * MW_BAND_WIDTH * 2.0);
  vec3 mwColor = mix(
    vec3(0.565, 0.670, 0.880),
    vec3(0.95, 0.61, 0.50),
    centerFade
  );

  return mwColor * band * dustLane * lonBright * structure * MW_STRENGTH;
}

float procStar(vec2 uv, float flare, float blur) {
  float d = length(uv);
  float m = 0.00008 / max(d * d, 0.00001 * blur);

  float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1200.0));
  m += rays * flare * 0.015;
  uv *= rot(PI * 0.25);
  rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1200.0));
  m += rays * flare * 0.3 * 0.015;

  m *= smoothstep(1.0, 0.15, d);
  return m;
}

vec3 bgStarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      float n = hash21(id + offs);
      float size = fract(n * 345.32);
      if (size < 0.1) {
        continue;
      }
      float flare = smoothstep(0.9, 1.0, size) * 0.5;
      vec2 starOff = vec2(n, fract(n * 34.0));
      vec2 localUV = gv - offs - starOff + 0.5;
      float s = procStar(localUV / 2.0, flare, 1.0);
      vec3 tint = mix(vec3(1.0, 0.85, 0.7), vec3(0.7, 0.85, 1.0), fract(n * 123.45));
      col += tint * s * size * 0.06;
    }
  }
  return col * vec3(0.67, 0.67, 1.0) * 1.2;
}

vec2 dirToOctUV(vec3 n) {
  n /= (abs(n.x) + abs(n.y) + abs(n.z));
  vec2 uv = n.xz;
  if (n.y < 0.0) {
    uv = (1.0 - abs(uv.yx)) * sign(uv.xy);
  }
  return uv;
}

vec3 shellStarField(Ray r, vec3 center, float radius, float scale, float brightness, vec2 offset) {
  vec3 oc = r.o - center;
  float b = dot(oc, r.d);
  float h = b * b - dot(oc, oc) + radius * radius;
  if (h < 0.0) {
    return vec3(0.0);
  }

  float t = -b + sqrt(h);
  vec3 hit = r.o + r.d * t;
  vec3 localDir = normalize(hit - center);

  vec2 uv = dirToOctUV(localDir) * scale + offset;
  return bgStarLayer(uv) * brightness;
}

vec3 mwStarLayer(vec2 uv, vec3 rd, vec2 resolution) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  float sinB = dot(rd, GAL_NORTH);
  float absB = abs(sinB);
  float galWeight = smoothstep(1.0 / sqrt(MW_STAR_FOCUS), 0.0, absB);

  vec3 inPlane = normalize(rd - sinB * GAL_NORTH);
  vec3 galPerp = normalize(cross(GAL_NORTH, GAL_CENTER));
  float galLon = atan(dot(inPlane, galPerp), dot(inPlane, GAL_CENTER));
  float lonWeight = 0.5 + 0.5 * (0.5 + 0.5 * cos(galLon));

  float density = galWeight * lonWeight;
  if (density < 0.01) {
    return vec3(0.0);
  }

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      float n = hash21(id + offs);
      float threshold = (1.0 - MW_STAR_DENSITY) - MW_STAR_DENSITY * density;
      float size = fract(n * 345.32);
      if (size < threshold) {
        continue;
      }
      float flare = smoothstep(0.92, 1.0, size) * 0.4;
      vec2 starOff = vec2(n, fract(n * 34.0));
      vec2 localUV = gv - offs - starOff + 0.5;
      float s = procStar(localUV / 1.8, flare, 3333.0 * (3.33 / resolution.y));
      vec3 tint = mix(vec3(1.0, 0.80, 0.60), vec3(0.80, 0.85, 1.0), fract(n * 123.45));
      col += tint * s * size * MW_STAR_BRIGHT * galWeight;
    }
  }
  return col * 1.33;
}

vec3 mwShellStars(Ray r, vec3 center, float radius, float scale, float brightness, vec2 offset, vec2 resolution) {
  vec3 oc = r.o - center;
  float b = dot(oc, r.d);
  float h = b * b - dot(oc, oc) + radius * radius;
  if (h < 0.0) {
    return vec3(0.0);
  }

  float t = -b + sqrt(h);
  vec3 hit = r.o + r.d * t;
  vec3 localDir = normalize(hit - center);

  vec2 uv = dirToOctUV(localDir) * scale + offset;
  return mwStarLayer(uv, r.d, resolution) * brightness * 1.5;
}

vec3 backgroundStars(Ray r, vec2 resolution) {
  vec3 col = vec3(0.0);
  col += shellStarField(r, CLUSTER_CENTER, 40.0, 12.0, 2.3, vec2(57.3, 124.9));
  col += shellStarField(r, CLUSTER_CENTER, 80.0, 16.0, 0.9, vec2(173.7, 91.4));
  col += shellStarField(r, CLUSTER_CENTER, 160.0, 24.0, 0.7, vec2(311.7, 207.4));

  col += mwShellStars(r, CLUSTER_CENTER, 180.0, 60.0, 1.33, vec2(42.1, 218.3), resolution);
  col += mwShellStars(r, CLUSTER_CENTER, 280.0, 120.0, 0.70, vec2(287.5, 63.9), resolution);
  return col;
}

void main() {
  initStars();

  vec2 uv = gl_FragCoord.xy / u_resolution.xy - 0.5;
  uv.y *= u_resolution.y / u_resolution.x;

  float t = u_time * 0.001 * u_speed;
  float time = (t - 4.0) * ORBIT_SPEED;

  vec3 galX = normalize(GAL_CENTER - GAL_NORTH * dot(GAL_CENTER, GAL_NORTH));
  vec3 galY = normalize(cross(GAL_NORTH, galX));

  float a = time * 0.35;
  vec3 planeDir = normalize(cos(a) * galX + sin(a) * galY);

  vec3 camPos = CLUSTER_CENTER + planeDir * ORBIT_RADIUS + GAL_NORTH * ORBIT_RADIUS * 0.20;
  vec3 lookAt = CLUSTER_CENTER + planeDir * ORBIT_RADIUS * 0.35;

  Ray r = setupCamera(uv, camPos, lookAt, CAMERA_ZOOM, WORLD_UP);

  vec3 col = vec3(0.0);

  col += milkyWay(r.d);
  col += backgroundStars(r, u_resolution);
  col += renderDustNebula(r);

  for (int i = 0; i < NUM_STARS; i++) {
    col += renderStar(r, starPos[i], starBright[i], starColor[i]);
  }

  col *= u_intensity;
  col = col / (col + 1.0);
  col *= u_color;

  gl_FragColor = vec4(col, 1.0);
}
`;

interface PleiadesUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  intensity: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface PleiadesGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: PleiadesUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): PleiadesUniforms | null => {
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

const createPleiadesGL = (): PleiadesGL | null => {
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

  const state: PleiadesGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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

  const existing = cache.pleiadesGL as PleiadesGL | null | undefined;
  const state = existing !== undefined ? existing : createPleiadesGL();
  cache.pleiadesGL = state;
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
  const intensity = Number(params.intensity ?? 2.2);
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
