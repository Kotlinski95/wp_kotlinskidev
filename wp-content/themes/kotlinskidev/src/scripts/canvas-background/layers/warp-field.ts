import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { WARP_FIELD_FRAGMENT_SHADER } from "./shaders/warp-field-fragment";

interface WarpFieldFrameValues {
  speed: number;
  density: number;
  color: Rgb01;
}

export default createShaderLayer<"speed" | "density" | "color", WarpFieldFrameValues>({
  cacheKey: "warpFieldGL",
  fragmentShader: WARP_FIELD_FRAGMENT_SHADER,
  extraUniforms: ["speed", "density", "color"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    speed: readNumberParam(params, "speed", 1),
    density: readNumberParam(params, "density", 1),
    color: readColorParam(params, "color", "#ffffff", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform1f(uniforms.density, values.density);
    gl.uniform3f(uniforms.color, ...values.color);
  },
});
