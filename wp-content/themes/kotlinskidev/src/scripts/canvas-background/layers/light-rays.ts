import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { LIGHT_RAYS_FRAGMENT_SHADER } from "./shaders/light-rays-fragment";

interface LightRaysFrameValues {
  rayCount: number;
  speed: number;
  color: Rgb01;
}

export default createShaderLayer<"rayCount" | "speed" | "color", LightRaysFrameValues>({
  cacheKey: "lightRaysGL",
  fragmentShader: LIGHT_RAYS_FRAGMENT_SHADER,
  extraUniforms: ["rayCount", "speed", "color"],
  defaultOpacity: 0.5,
  enableAlphaBlending: true,
  readFrameValues: (params, resolveColor) => ({
    rayCount: Math.max(1, Math.round(readNumberParam(params, "rayCount", 8))),
    speed: readNumberParam(params, "speed", 0.3),
    color: readColorParam(params, "color", "#ffffff", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.rayCount, values.rayCount);
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform3f(uniforms.color, ...values.color);
  },
});
