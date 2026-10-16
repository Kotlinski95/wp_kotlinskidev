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
uniform float u_rayCount;
uniform float u_speed;
uniform vec3 u_color;

vec2 cubicBezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {
  float s = 1.0 - t;
  return s * s * s * p0 + 3.0 * s * s * t * p1 + 3.0 * s * t * t * p2 + t * t * t * p3;
}

float distanceToBezier(vec2 point, vec2 p0, vec2 p1, vec2 p2, vec2 p3, out float closestT) {
  float minDist = 1e10;
  closestT = 0.0;

  const int samples = 24;
  for (int i = 0; i <= samples; i++) {
    float t = float(i) / float(samples);
    float dist = distance(point, cubicBezier(p0, p1, p2, p3, t));
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }

  float tMin = max(0.0, closestT - 0.03);
  float tMax = min(1.0, closestT + 0.03);
  for (int i = 0; i <= 6; i++) {
    float t = tMin + (tMax - tMin) * float(i) / 6.0;
    float dist = distance(point, cubicBezier(p0, p1, p2, p3, t));
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }

  return minDist;
}

void main() {
  float topWidth = 0.15;
  float bottomWidth = 1.0;
  float verticalLength = 0.45;
  float rayWidth = 0.005;
  float pulseWidth = 0.03;
  float trailLength = 0.5;
  float motionBlur = 0.3;
  float bgGlow = 1.2;
  float glowSpread = 1.0;
  float glowCurve = 0.2;

  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  float timeSeconds = u_time * 0.001 * u_speed;

  vec3 totalPulseColor = vec3(0.0);
  vec3 backgroundGlow = vec3(0.0);
  float rayCount = clamp(u_rayCount, 1.0, 32.0);

  for (float i = 0.0; i < 32.0; i += 1.0) {
    if (i >= rayCount) {
      break;
    }

    float rayIndex = i / max(1.0, rayCount - 1.0);
    float xStart = 0.5 + (rayIndex - 0.5) * topWidth;
    float centerOffset = rayIndex - 0.5;

    vec2 p0 = vec2(xStart, 0.0);
    vec2 p3 = vec2(0.5 + centerOffset * bottomWidth, 1.0);
    float targetOffset = centerOffset * bottomWidth;
    vec2 p1 = vec2(0.5 + targetOffset * 0.25, verticalLength + 0.35);
    vec2 p2 = vec2(0.5 + targetOffset * 0.0, 0.55);

    float closestT;
    float dist = distanceToBezier(uv, p0, p1, p2, p3, closestT);

    float widthAtT = mix(topWidth, bottomWidth, closestT);
    float widthScale = widthAtT / max(topWidth, bottomWidth);
    float scaledRayWidth = rayWidth * widthScale;

    float rayGlow = exp(-dist / scaledRayWidth);
    rayGlow = smoothstep(0.0, 0.1, rayGlow) * rayGlow;

    vec3 rayColor = mix(u_color, u_color * 0.6, uv.y);

    for (float p = 0.0; p < 2.0; p += 1.0) {
      float pulseTime = timeSeconds + i * 0.2 + p * 0.9;
      float pulsePos = fract(pulseTime);
      float pulseDist = abs(closestT - pulsePos);

      float pulseWidthAtT = mix(topWidth, bottomWidth, pulsePos);
      float pulseWidthScale = pulseWidthAtT / max(topWidth, bottomWidth);
      float scaledPulseWidth = pulseWidth * pulseWidthScale;

      float pulse = exp(-pulseDist / scaledPulseWidth) * rayGlow;

      float trailDist = pulsePos - closestT;
      if (trailDist > 0.0 && trailDist < trailLength) {
        float trailFade = (1.0 - trailDist / trailLength) * 0.3;
        pulse += trailFade * rayGlow;

        for (int b = 0; b < 3; b++) {
          float blurOffset = trailDist * float(b) / 3.0;
          float blurFade = exp(-blurOffset / (trailLength * 0.5)) * motionBlur;
          pulse += blurFade * rayGlow * 0.2;
        }
      }

      pulse *= smoothstep(1.0, 0.8, pulsePos);
      totalPulseColor += rayColor * pulse;
    }

    float bgGlowDist = dist / (rayWidth * 10.0);
    float baseGlowIntensity = exp(-bgGlowDist) * bgGlow * 0.15;
    float spreadWeight = smoothstep(0.3, 1.0, closestT) * glowSpread;
    float curveWeight = exp(-pow((closestT - 0.5) * 3.0, 2.0)) * glowCurve;
    float glowWeight = spreadWeight + curveWeight;

    backgroundGlow += rayColor * (baseGlowIntensity * glowWeight);
  }

  float yFade = smoothstep(0.0, 0.15, uv.y);
  vec3 finalColor = totalPulseColor * yFade;
  finalColor += backgroundGlow;

  float vignette = 1.0 - smoothstep(0.7, 1.2, length(uv - vec2(0.5)));
  finalColor *= vignette * 0.3 + 0.7;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface CurvedRaysUniforms {
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  rayCount: WebGLUniformLocation;
  speed: WebGLUniformLocation;
  color: WebGLUniformLocation;
}

interface CurvedRaysGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  uniforms: CurvedRaysUniforms;
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

const setupProgram = (gl: WebGLRenderingContext): CurvedRaysUniforms | null => {
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

  return { resolution, time, rayCount, speed, color };
};

const createCurvedRaysGL = (): CurvedRaysGL | null => {
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

  const state: CurvedRaysGL = { canvas, gl, uniforms, width: 0, height: 0, lost: false };

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

  const existing = cache.curvedRaysGL as CurvedRaysGL | null | undefined;
  const state = existing !== undefined ? existing : createCurvedRaysGL();
  cache.curvedRaysGL = state;
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

  const rayCount = Math.max(1, Math.round(Number(params.rayCount ?? 16)));
  const speed = Number(params.speed ?? 0.4);
  const [r, g, b] = parseColorToRgb01(resolveColor(String(params.color ?? "#cccccc")));

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
