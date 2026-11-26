import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { CURVED_RAYS_FRAGMENT_SHADER } from "./shaders/curved-rays-fragment";

interface CurvedRaysFrameValues {
  rayCount: number;
  speed: number;
  color: Rgb01;
}

export default createShaderLayer<"rayCount" | "speed" | "color", CurvedRaysFrameValues>({
  cacheKey: "curvedRaysGL",
  fragmentShader: CURVED_RAYS_FRAGMENT_SHADER,
  extraUniforms: ["rayCount", "speed", "color"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    rayCount: Math.max(1, Math.round(readNumberParam(params, "rayCount", 16))),
    speed: readNumberParam(params, "speed", 0.4),
    color: readColorParam(params, "color", "#cccccc", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.rayCount, values.rayCount);
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform3f(uniforms.color, ...values.color);
  },
});
