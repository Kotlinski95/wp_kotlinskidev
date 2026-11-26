import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { NEON_WAVES_FRAGMENT_SHADER } from "./shaders/neon-waves-fragment";

interface NeonWavesFrameValues {
  speed: number;
  intensity: number;
  color: Rgb01;
}

export default createShaderLayer<"speed" | "intensity" | "color", NeonWavesFrameValues>({
  cacheKey: "neonWavesGL",
  fragmentShader: NEON_WAVES_FRAGMENT_SHADER,
  extraUniforms: ["speed", "intensity", "color"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    speed: readNumberParam(params, "speed", 0.6),
    intensity: readNumberParam(params, "intensity", 3),
    color: readColorParam(params, "color", "#ffffff", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform1f(uniforms.intensity, values.intensity);
    gl.uniform3f(uniforms.color, ...values.color);
  },
});
