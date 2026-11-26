import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { FLOATING_PANELS_FRAGMENT_SHADER } from "./shaders/floating-panels-fragment";

interface FloatingPanelsFrameValues {
  speed: number;
  colorStart: Rgb01;
  colorEnd: Rgb01;
}

export default createShaderLayer<"speed" | "colorStart" | "colorEnd", FloatingPanelsFrameValues>({
  cacheKey: "floatingPanelsGL",
  fragmentShader: FLOATING_PANELS_FRAGMENT_SHADER,
  extraUniforms: ["speed", "colorStart", "colorEnd"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    speed: readNumberParam(params, "speed", 1),
    colorStart: readColorParam(params, "colorStart", "#03296b", resolveColor),
    colorEnd: readColorParam(params, "colorEnd", "#034291", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform3f(uniforms.colorStart, ...values.colorStart);
    gl.uniform3f(uniforms.colorEnd, ...values.colorEnd);
  },
});
