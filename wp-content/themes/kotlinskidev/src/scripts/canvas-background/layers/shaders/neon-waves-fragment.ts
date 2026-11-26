export const NEON_WAVES_FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_intensity;
uniform vec3 u_color;

const float scaleX = 2.0;
const float scaleY = 2.0;
const float roundness = 1.0;
const int iterLimit = 10;

const vec3 tone1 = vec3(0.369, 0.369, 0.369);
const vec3 tone2 = vec3(0.749, 0.749, 0.749);
const vec3 tone3 = vec3(0.851, 0.851, 0.851);

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 I = gl_FragCoord.xy;
  float t = u_time * 0.001 * u_speed;

  float z = 0.0;
  float d = 0.0;
  vec4 O = vec4(0.0);

  for (int i = 0; i < iterLimit; i++) {
    vec3 p = z * normalize(vec3(I + I, 0.0) - u_resolution.xyy);

    p.x += sin(p.x + t * 0.5) + cos(p.y + t * 0.3);
    p.y += cos(p.x - t * 0.4) + sin(p.y + t * 0.6);
    p.z += sin(t * 0.2) * 1.5;

    p.x *= scaleX;
    p.y *= scaleY;

    vec3 v = cos(p) - sin(p).yzx;
    vec3 shape = mix(max(v, v.yzx * 0.2), v, roundness);

    d = 1e-4 + 0.5 * length(shape);
    z += d;

    vec3 weights = abs(cos(p));
    weights /= dot(weights, vec3(1.0));

    vec3 blended = tone1 * weights.x + tone2 * weights.y + tone3 * weights.z;
    O.rgb += (blended * u_intensity) / d;
  }

  O /= O + 300.0;

  float luminance = dot(O.rgb, vec3(0.299, 0.587, 0.114));
  O.rgb = mix(vec3(luminance), O.rgb, 1.6);

  O.rgb += (random(I) - 0.5) / 128.0;
  O.rgb *= u_color;

  gl_FragColor = vec4(O.rgb, 1.0);
}
`;
