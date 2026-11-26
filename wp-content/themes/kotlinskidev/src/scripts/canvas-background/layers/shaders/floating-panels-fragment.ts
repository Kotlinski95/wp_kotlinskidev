export const FLOATING_PANELS_FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;

const float noiseIntensity = 2.8;
const float noiseDefinition = 0.6;
const vec2 glowPos = vec2(-2.0, 0.0);

const float total = 60.0;
const float minSize = 0.03;
const float maxSize = 0.08 - minSize;
const float yDistribution = 0.5;

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(in vec2 p) {
  p *= noiseIntensity;
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
    mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y
  );
}

float fbm(in vec2 uv) {
  uv *= 5.0;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float f = 0.5000 * noise(uv); uv = m * uv;
  f += 0.2500 * noise(uv); uv = m * uv;
  f += 0.1250 * noise(uv); uv = m * uv;
  f += 0.0625 * noise(uv); uv = m * uv;
  return 0.5 + 0.5 * f;
}

vec3 bg(vec2 uv, float t) {
  float velocity = t / 1.6;
  float intensity = sin(uv.x * 3.0 + velocity * 2.0) * 1.1 + 1.5;
  uv.y -= 2.0;
  vec2 bp = uv + glowPos;
  uv *= noiseDefinition;

  float rb = fbm(vec2(uv.x * 0.5 - velocity * 0.03, uv.y)) * 0.1;
  uv += rb;

  float rz = fbm(uv * 0.9 + vec2(velocity * 0.35, 0.0));
  rz *= dot(bp * intensity, bp) + 1.2;

  vec3 col = u_colorStart / (0.1 - rz);
  return sqrt(abs(col));
}

float rectangle(vec2 uv, vec2 pos, float width, float height, float blur) {
  vec2 d = (vec2(width, height) + 0.01) / 2.0 - abs(uv - pos);
  d = smoothstep(0.0, blur, d);
  return d.x * d.y;
}

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
  float t = u_time * 0.001 * u_speed;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 color = bg(uv, t) * (2.0 - abs(uv.y * 2.0));

  float velX = -t / 8.0;
  float velY = t / 10.0;

  for (int i = 0; i < 60; i++) {
    float index = float(i) / total;
    float rnd = random(vec2(index));

    vec2 pos = vec2(0.0);
    pos.x = fract(velX * rnd + index) * 4.0 - 2.0;
    pos.y = sin(index * rnd * 1000.0 + velY) * yDistribution;
    float size = maxSize * rnd + minSize;

    vec2 uvRot = uv - pos + size / 2.0;
    uvRot = rotate2d(float(i) + t / 2.0) * uvRot;
    uvRot += pos + size / 2.0;

    float rect = rectangle(uvRot, pos, size, size, (maxSize + minSize - size) / 2.0);
    color += u_colorEnd * rect * size / maxSize;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
