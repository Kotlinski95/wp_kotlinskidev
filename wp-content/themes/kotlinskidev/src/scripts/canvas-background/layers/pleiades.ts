import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { PLEIADES_FRAGMENT_SHADER } from "./shaders/pleiades-fragment";

interface PleiadesFrameValues {
  speed: number;
  intensity: number;
  color: Rgb01;
}

export default createShaderLayer<"speed" | "intensity" | "color", PleiadesFrameValues>({
  cacheKey: "pleiadesGL",
  fragmentShader: PLEIADES_FRAGMENT_SHADER,
  extraUniforms: ["speed", "intensity", "color"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    speed: readNumberParam(params, "speed", 1),
    intensity: readNumberParam(params, "intensity", 2.2),
    color: readColorParam(params, "color", "#ffffff", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform1f(uniforms.intensity, values.intensity);
    gl.uniform3f(uniforms.color, ...values.color);
  },
});
