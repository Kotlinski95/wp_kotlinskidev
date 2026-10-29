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
uniform float u_zoom;
uniform vec3 u_color;

const float tau = 6.283185307179586;

float sRGBChannel(float t) {
  return mix(1.055 * pow(t, 1.0 / 2.4) - 0.055, 12.92 * t, step(t, 0.0031308));
}

vec3 toSRGB(vec3 c) {
  return vec3(sRGBChannel(c.x), sRGBChannel(c.y), sRGBChannel(c.z));
}

float tanhApprox(float x) {
  float x2 = x * x;
  return clamp(x * (27.0 + x2) / (27.0 + 9.0 * x2), -1.0, 1.0);
}

vec3 rgb2hsv(vec3 c) {
  vec4 k = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, k.wz), vec4(c.gb, k.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 k = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + k.xyz) * 6.0 - k.www);
  return c.z * mix(k.xxx, clamp(p - k.xxx, 0.0, 1.0), c.y);
}

float hash(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 58.233))) * 13758.5453);
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

vec2 round2(vec2 v) {
  return floor(v + 0.5);
}

vec2 hextile(inout vec2 p) {
  const vec2 sz = vec2(1.0, 1.7320508);
  const vec2 hsz = 0.5 * sz;

  vec2 p1 = mod(p, sz) - hsz;
  vec2 p2 = mod(p - hsz, sz) - hsz;
  vec2 p3 = dot(p1, p1) < dot(p2, p2) ? p1 : p2;
  vec2 n = (p3 - p + hsz) / sz;
  p = p3;

  n -= vec2(0.5);
  return round2(n * 2.0) * 0.5;
}

float hexagon(vec2 p, float r) {
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}

float shape(vec2 p) {
  return hexagon(p.yx, 0.4) - 0.075;
}

float cellHeight(float h) {
  return 0.1 * (-h);
}

vec3 cell(vec2 p, float h) {
  float hd = shape(p);
  const float he = 0.015;
  float hh = -he * smoothstep(he, -he, hd);
  return vec3(hd, hh, cellHeight(h));
}

float cellHeightAt(vec2 p, float h) {
  return cell(p, h).y;
}

vec3 cellNormal(vec2 p, float h, vec2 resolution) {
  vec2 e = vec2(4.0 / resolution.y, 0.0);
  vec3 n;
  n.x = cellHeightAt(p + e.xy, h) - cellHeightAt(p - e.xy, h);
  n.y = cellHeightAt(p + e.yx, h) - cellHeightAt(p - e.yx, h);
  n.z = 2.0 * e.x;
  return normalize(n);
}

vec3 planeColor(vec3 lp, vec3 pp, vec3 pnor, vec3 bcol, vec3 pcol) {
  vec3 ld = normalize(lp - pp);
  float dif = max(dot(ld, pnor), 0.0);
  return mix(bcol, pcol, dif);
}

float cutSlice(vec2 p, vec2 off) {
  p.x = abs(p.x);
  off.x *= 0.5;

  vec2 nn = normalize(off);
  vec2 n = vec2(nn.y, -nn.x);

  float d0 = length(p - off);
  float d1 = -(p.y - off.y);
  float d2 = dot(n, p);

  bool b = p.x > off.x && (dot(nn, p) - dot(nn, off)) < 0.0;
  return b ? d0 : max(d1, d2);
}

float hexSlice(vec2 p, int n) {
  p = rotate(p, -float(n) * tau / 6.0);
  p = p.yx;
  const vec2 dim = vec2(0.577350269, 0.5);
  return cutSlice(p, dim);
}

vec3 effect(vec2 p, float t, float zoom, vec3 color, vec2 resolution) {
  float z = 0.327 * zoom;
  float aa = 2.0 / (z * resolution.y);

  p = p.yx;

  vec3 lp = vec3(3.0, 0.0, 1.0);

  p -= vec2(0.195, 0.0);
  p /= z;

  float toff = 0.2 * t;
  p.x += toff;
  lp.x += toff;

  vec2 hp = p;
  vec2 hn = hextile(hp);
  float hh = hash(hn);
  vec3 c = cell(hp, hh);
  float cd = c.x;
  float ch = c.z;

  vec3 fpp = vec3(p, ch);
  vec3 bpp = vec3(p, 0.0);

  vec3 bnor = vec3(0.0, 0.0, 1.0);
  vec3 bdif = lp - bpp;
  float bl2 = dot(bdif, bdif);

  vec3 fnor = cellNormal(hp, hh, resolution);
  vec3 fld = normalize(lp - fpp);

  float sf = 0.0;

  for (int i = 0; i < 6; i++) {
    float ang = float(i) * tau / 6.0;
    vec2 ioff = vec2(cos(ang), sin(ang));
    vec2 ip = p + ioff;
    vec2 ihn = hextile(ip);
    float ihh = hash(ihn);
    float ich = cellHeight(ihh);
    float iii = (ich - ch) / fld.z;
    vec3 ipp = vec3(hp, ch) + iii * fld;

    float hsd = hexSlice(ipp.xy, i);
    if (ich > ch) {
      sf += exp(-20.0 * tanhApprox(1.0 / (10.0 * iii)) * max(hsd + 0.0, 0.0));
    }
  }

  vec3 hsv = rgb2hsv(color);
  float hue = hsv.x;
  float sat = hsv.y;

  vec3 bpcol = planeColor(lp, bpp, bnor, vec3(0.0), hsv2rgb(vec3(hue, sat, 0.14)));
  vec3 fpcol = planeColor(lp, fpp, fnor, bpcol, hsv2rgb(vec3(hue, sat, 0.19)));

  vec3 col = bpcol;
  col = mix(col, fpcol, smoothstep(aa, -aa, cd));
  col *= 1.0 - tanhApprox(sf);

  float fo = exp(-0.025 * max(bl2, 0.0));
  col *= fo;
  col = mix(bpcol, col, fo);

  return col;
}

void main() {
  float t = u_time * 0.001 * u_speed;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = -1.0 + 2.0 * uv;
  p.x *= u_resolution.x / u_resolution.y;

  vec3 col = effect(p, t, u_zoom, u_color, u_resolution);
  col = toSRGB(col);

  gl_FragColor = vec4(col, 1.0);
}
`;

interface HexTilesUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  zoom: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface HexTilesGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: HexTilesUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): HexTilesUniforms | null => {
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
  const zoom = gl.getUniformLocation(program, "u_zoom");
  const color = gl.getUniformLocation(program, "u_color");
  if (!resolution || !time || !speed || !zoom || !color) {
    return null;
  }

  return { resolution, time, speed, zoom, color };
};

const createHexTilesGL = (): HexTilesGL | null => {
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

  const state: HexTilesGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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

  const existing = cache.hexTilesGL as HexTilesGL | null | undefined;
  const state = existing !== undefined ? existing : createHexTilesGL();
  cache.hexTilesGL = state;
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
  const zoom = Number(params.zoom ?? 1);
  const [r, g, b] = parseColorToRgb01(resolveColor(String(params.color ?? "#2b3a66")));

  const { gl, uniforms } = state;
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform1f(uniforms.time, time);
  gl.uniform1f(uniforms.speed, speed);
  gl.uniform1f(uniforms.zoom, zoom);
  gl.uniform3f(uniforms.color, r, g, b);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
