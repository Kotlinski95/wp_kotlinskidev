import type { CanvasLayerDraw } from "../types";

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
uniform float u_speed;
uniform float u_layerCount;
uniform vec3 u_color;

#define TAU 6.283185
#define SPEED_SCALE 10.0

float safeSin(float x) {
  return sin(mod(x, TAU));
}

float hash1(vec2 p) {
  return fract(safeSin(p.x * 997.0 + p.y * 9011.0) * 1051.0);
}

float hash2(vec2 p) {
  return fract(safeSin(p.x * 99119.0 + p.y * 104729.0) * 10151.0);
}

float hash3(vec2 p) {
  return fract(safeSin(p.x * 499.0 + p.y * 78779.0) * 23819.0);
}

float hash4(vec2 p) {
  return fract(safeSin(p.x * 20747.0 + p.y * 90887.0) * 14543.0);
}

float star(vec2 uv, float radius, float flare) {
  float d = length(uv);
  float col = 0.01 / d;
  float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  col += rays * flare;
  col *= smoothstep(radius, 0.0, d);
  return col;
}

float starField(vec2 uv) {
  vec2 localUv = fract(uv + 0.5) - 0.5;
  vec2 cellId = floor(uv + 0.5);
  float brightness = 0.0;

  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 offset = vec2(float(x), float(y));
      float present = hash1(cellId + offset);
      if (present < 0.09) {
        float jitterX = hash2(cellId + offset);
        float jitterY = hash3(cellId + offset);
        float flare = hash4(cellId + offset);
        brightness += star(localUv - offset + vec2(jitterX, jitterY), flare, 1.0);
      }
    }
  }

  return brightness;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float timeSeconds = u_time * 0.001 * u_speed;
  float layerCount = clamp(u_layerCount, 3.0, 12.0);

  vec3 col = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    if (float(i) >= layerCount) {
      break;
    }
    float layer = float(i) / layerCount;
    float depth = fract(layer - timeSeconds / SPEED_SCALE);
    float scale = mix(20.0, 0.1, depth);
    float fade = smoothstep(0.1, 0.5, depth);
    col += vec3(starField(uv * scale + layer * 1123.0) * fade);
  }

  if (timeSeconds < SPEED_SCALE) {
    float introScale = 1.0 + mix(20.0, 0.1, fract(-timeSeconds / SPEED_SCALE));
    col += vec3(star(uv * introScale, 1.0, 1.0));
  }

  gl_FragColor = vec4(col * u_color, 1.0);
}
`;

interface StarFieldUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  layerCount: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface StarFieldGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: StarFieldUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): StarFieldUniforms | null => {
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
  const layerCount = gl.getUniformLocation(program, "u_layerCount");
  const color = gl.getUniformLocation(program, "u_color");
  if (!resolution || !time || !speed || !layerCount || !color) {
    return null;
  }

  return { resolution, time, speed, layerCount, color };
};

const createStarFieldGL = (): StarFieldGL | null => {
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

  const state: StarFieldGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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

  const existing = cache.starFieldGL as StarFieldGL | null | undefined;
  const state = existing !== undefined ? existing : createStarFieldGL();
  cache.starFieldGL = state;
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

  const layerCount = Math.max(3, Math.round(Number(params.layerCount ?? 7)));
  const speed = Number(params.speed ?? 1);
  const [r, g, b] = parseColorToRgb01(resolveColor(String(params.color ?? "#ffffff")));

  const { gl, uniforms } = state;
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform1f(uniforms.time, time);
  gl.uniform1f(uniforms.speed, speed);
  gl.uniform1f(uniforms.layerCount, layerCount);
  gl.uniform3f(uniforms.color, r, g, b);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(state.canvas, 0, 0, width, height);
  ctx.restore();
};

export default draw;
