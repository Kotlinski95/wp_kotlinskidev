export const FULLSCREEN_VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FULLSCREEN_QUAD_CORNERS = [-1, -1, 1, -1, -1, 1, 1, 1];
const QUAD_COMPONENTS_PER_VERTEX = 2;
const QUAD_VERTEX_COUNT = 4;

export const compileShader = (
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

export const linkProgram = (
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

export const uploadFullscreenQuad = (gl: WebGLRenderingContext): void => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD_CORNERS), gl.STATIC_DRAW);
};

export const bindPositionAttribute = (gl: WebGLRenderingContext, program: WebGLProgram): void => {
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, QUAD_COMPONENTS_PER_VERTEX, gl.FLOAT, false, 0, 0);
};

export const drawFullscreenQuad = (gl: WebGLRenderingContext): void => {
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, QUAD_VERTEX_COUNT);
};

export const getWebGlContext = (canvas: HTMLCanvasElement): WebGLRenderingContext | null =>
  canvas.getContext("webgl") ??
  (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

export const onContextLost = (canvas: HTMLCanvasElement, handler: () => void): void => {
  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
      handler();
    },
    false
  );
};

export const onContextRestored = (canvas: HTMLCanvasElement, handler: () => void): void => {
  canvas.addEventListener("webglcontextrestored", handler, false);
};
