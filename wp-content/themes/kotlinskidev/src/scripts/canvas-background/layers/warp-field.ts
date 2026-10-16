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
uniform float u_density;
uniform vec3 u_color;

float hash31(vec3 p) {
  return fract(sin(dot(p, vec3(10.9898, 70.233, 40.6474))) * 45758.5433);
}

float starnoise(vec3 rd, float density) {
  const vec3 amps = vec3(0.6, 0.45, 0.15);
  const vec4 cs = vec4(3.0 / 5.0, 4.0 / 5.0, 5.0 / 13.0, 12.0 / 13.0);
  const mat3 arbitraryRotAndScale = mat3(
    dot(amps, vec3(1.0, cs.x, cs.z)), amps.z * cs.w, amps.y * cs.y,
    -cs.w * amps.z, dot(amps, vec3(1.0, 1.0, cs.z)), 0.0,
    -cs.y * amps.y, 0.0, dot(amps, vec3(1.0, cs.x, 1.0))
  );

  float c = 0.0;
  vec3 p = rd * 300.0;
  for (float i = 0.0; i < 4.0; i += 1.0) {
    vec3 q = fract(p) - 0.5;
    vec3 id = floor(p);
    float c2 = smoothstep(0.25, 0.0, dot(q, q));
    c2 *= step(hash31(id), density * (0.02 - i * i * 0.002));
    c += c2;
    p = p * arbitraryRotAndScale;
  }
  c *= c;

  float g = dot(sin(rd * 12.12), cos(rd.yzx * 4.512));
  float d = smoothstep(-3.14159265359, -0.9, g) * 0.5 + 0.5 * smoothstep(-0.3, 1.0, g);
  c *= d * d * 0.5 + d * 0.5;
  return c * c;
}

void main() {
  float t = u_time * 0.001 * u_speed;
  float zoom = 2.0 - cos(t * 0.2);

  float angle = t * 0.05;
  float cy = cos(angle);
  float sy = sin(angle);
  mat3 rotateYaw = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);

  vec3 rd = normalize(vec3(gl_FragCoord.xy - u_resolution * 0.5, zoom * u_resolution.y)) * rotateYaw;

  float l = starnoise(rd, u_density);
  gl_FragColor = vec4(sqrt(l)) * vec4(u_color, 1.0);
}
`;

interface WarpFieldUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  density: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface WarpFieldGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: WarpFieldUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): WarpFieldUniforms | null => {
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
  const density = gl.getUniformLocation(program, "u_density");
  const color = gl.getUniformLocation(program, "u_color");
  if (!resolution || !time || !speed || !density || !color) {
    return null;
  }

  return { resolution, time, speed, density, color };
};

const createWarpFieldGL = (): WarpFieldGL | null => {
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

  const state: WarpFieldGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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

  const existing = cache.warpFieldGL as WarpFieldGL | null | undefined;
  const state = existing !== undefined ? existing : createWarpFieldGL();
  cache.warpFieldGL = state;
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
  const density = Number(params.density ?? 1);
  const [r, g, b] = parseColorToRgb01(resolveColor(String(params.color ?? "#ffffff")));

  const { gl, uniforms } = state;
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform1f(uniforms.time, time);
  gl.uniform1f(uniforms.speed, speed);
  gl.uniform1f(uniforms.density, density);
  gl.uniform3f(uniforms.color, r, g, b);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
