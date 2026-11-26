import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { STAR_FIELD_FRAGMENT_SHADER } from "./shaders/star-field-fragment";

interface StarFieldFrameValues {
  speed: number;
  layerCount: number;
  color: Rgb01;
}

export default createShaderLayer<"speed" | "layerCount" | "color", StarFieldFrameValues>({
  cacheKey: "starFieldGL",
  fragmentShader: STAR_FIELD_FRAGMENT_SHADER,
  extraUniforms: ["speed", "layerCount", "color"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    speed: readNumberParam(params, "speed", 1),
    layerCount: Math.max(3, Math.round(readNumberParam(params, "layerCount", 7))),
    color: readColorParam(params, "color", "#ffffff", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform1f(uniforms.layerCount, values.layerCount);
    gl.uniform3f(uniforms.color, ...values.color);
  },
});
