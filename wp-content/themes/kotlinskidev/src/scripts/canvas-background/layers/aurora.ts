import { createShaderLayer, readColorParam, readNumberParam, type Rgb01 } from "../shader-layer";
import { AURORA_FRAGMENT_SHADER } from "./shaders/aurora-fragment";

interface AuroraFrameValues {
  speed: number;
  colorStart: Rgb01;
  colorEnd: Rgb01;
}

export default createShaderLayer<"speed" | "colorStart" | "colorEnd", AuroraFrameValues>({
  cacheKey: "auroraGL",
  fragmentShader: AURORA_FRAGMENT_SHADER,
  extraUniforms: ["speed", "colorStart", "colorEnd"],
  defaultOpacity: 1,
  readFrameValues: (params, resolveColor) => ({
    speed: readNumberParam(params, "speed", 1),
    colorStart: readColorParam(params, "colorStart", "#8066ff", resolveColor),
    colorEnd: readColorParam(params, "colorEnd", "#99e6ff", resolveColor),
  }),
  applyUniforms: (gl, uniforms, values) => {
    gl.uniform1f(uniforms.speed, values.speed);
    gl.uniform3f(uniforms.colorStart, ...values.colorStart);
    gl.uniform3f(uniforms.colorEnd, ...values.colorEnd);
  },
});
