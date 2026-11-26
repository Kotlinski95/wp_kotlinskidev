export const NEBULA_FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_zoom;
uniform vec3 u_color;

const float pi = 3.141592653589793;

vec4 hash44(vec4 p4) {
  p4 *= vec4(0.1031, 0.1030, 0.0973, 0.1099);
  p4 = fract(p4);
  p4 += dot(p4, p4.wzxy + 33.33);
  p4 = (p4.xxyz + p4.yzzw) * p4.zywx;
  p4 = fract(p4);
  return p4;
}

float voronoi(in vec3 p, out vec3 c) {
  float d = 10.0;

  for (int offsetX = -1; offsetX <= 1; offsetX++) {
    for (int offsetY = -1; offsetY <= 1; offsetY++) {
      for (int offsetZ = -1; offsetZ <= 1; offsetZ++) {
        vec3 offset = vec3(float(offsetX), float(offsetY), float(offsetZ));
        vec4 h = hash44(vec4(offset + floor(p), 0.0));
        vec3 point = offset + h.xyz;
        float t = dot(point - fract(p), point - fract(p));
        if (t < d) {
          c = hash44(h.xyzw).rgb;
        }
        d = min(t, d);
      }
    }
  }

  return d;
}

float gradientNoise(vec3 p, float t) {
  vec3 f = smoothstep(0.0, 1.0, fract(p));
  vec3 i = floor(p);

  float h0 = hash44(vec4(i + vec3(0.0, 0.0, 0.0), t)).x;
  float h1 = hash44(vec4(i + vec3(1.0, 0.0, 0.0), t)).x;
  float h2 = hash44(vec4(i + vec3(0.0, 1.0, 0.0), t)).x;
  float h3 = hash44(vec4(i + vec3(1.0, 1.0, 0.0), t)).x;
  float h4 = hash44(vec4(i + vec3(0.0, 0.0, 1.0), t)).x;
  float h5 = hash44(vec4(i + vec3(1.0, 0.0, 1.0), t)).x;
  float h6 = hash44(vec4(i + vec3(0.0, 1.0, 1.0), t)).x;
  float h7 = hash44(vec4(i + vec3(1.0, 1.0, 1.0), t)).x;

  return mix(
    mix(mix(h0, h1, f.x), mix(h2, h3, f.x), f.y),
    mix(mix(h4, h5, f.x), mix(h6, h7, f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float value = 0.0;
  float accum = 0.0;
  float atten = 0.5;
  float scale = 1.0;

  for (int i = 0; i < 5; i++) {
    value += atten * gradientNoise(scale * p, float(i));
    accum += atten;
    atten *= 0.5;
    scale *= 2.0;
  }

  return value / accum;
}

vec3 blackbody(float t) {
  float h = 6.6e-34;
  float k = 1.4e-23;
  float c = 3e8;

  vec3 w = vec3(610.0, 549.0, 468.0) / 1e9;

  vec3 w5 = w * w * w * w * w;
  vec3 o = 2.0 * h * (c * c) / (w5 * (exp(h * c / (w * k * t)) - 1.0));

  return o;
}

vec3 skyColor(vec3 dir) {
  const float t = 0.05;

  vec3 c;
  float v = (1.0 / t) * clamp(t - voronoi(80.0 * dir, c), 0.0, 1.0);

  vec3 b = 0.4 * clamp(1.0 - exp(-max(blackbody((300.0 * c.x) + 600.0), 0.0)), 0.0, 1.0) + 0.6;

  float n0 = fbm(3.0 * dir);
  float n1 = fbm(4.0 * (dir + 1.0));

  float d0 = 3.0 * (max(n0 - 0.4, 0.0) + 0.07);
  float d1 = smoothstep(0.0, 1.0, max(n1 - (4.0 * dir.y * dir.y), 0.0));

  return (b * v * d0 * (1.0 - d1)) + d1;
}

vec2 rotate(vec2 vec, float rot) {
  float s = sin(rot);
  float c = cos(rot);
  return vec2(vec.x * c - vec.y * s, vec.x * s + vec.y * c);
}

void main() {
  float t = u_time * 0.001 * u_speed;
  vec2 uv = 2.0 * (gl_FragCoord.xy - 0.5 * u_resolution) / max(u_resolution.x, u_resolution.y);

  vec3 rd = normalize(vec3(rotate(vec2(u_zoom * uv.x, -1.0), 0.03 * pi * t), u_zoom * uv.y).xzy);

  gl_FragColor = vec4(skyColor(rd) * u_color, 1.0);
}
`;
