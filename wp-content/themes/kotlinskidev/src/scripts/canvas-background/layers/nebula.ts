import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { NEBULA_FRAGMENT_SHADER } from "./shaders/nebula-fragment";

interface NebulaFrameValues {
  speed: number;
  zoom: number;
  color: Rgb01;
}

export default createShaderLayer<"speed" | "zoom" | "color", NebulaFrameValues>({
  cacheKey: "nebulaGL",
  fragmentShader: NEBULA_FRAGMENT_SHADER,
  extraUniforms: ["speed", "zoom", "color"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    speed: readNumberParam(params, "speed", 1),
    zoom: readNumberParam(params, "zoom", 1),
    color: readColorParam(params, "color", "#ffffff", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform1f(uniforms.zoom, values.zoom);
    gl.uniform3f(uniforms.color, ...values.color);
  },
});
