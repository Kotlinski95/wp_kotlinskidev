export const PLEIADES_STAR_CATALOG_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_intensity;
uniform vec3 u_color;

#define BLUEFACTOR 1.5
const int NUM_STARS = 20;

vec3 starPos[20];
float starBright[20];
vec3 starColor[20];

void initStars() {
  starPos[0] = vec3(1.15, -0.05, -0.4);
  starPos[1] = vec3(4.58, -0.62, 2.1);
  starPos[2] = vec3(-4.40, -0.05, -1.9);
  starPos[3] = vec3(-2.42, 2.32, -2.6);
  starPos[4] = vec3(-1.41, -1.58, 5.2);
  starPos[5] = vec3(-3.76, 3.21, -2.5);
  starPos[6] = vec3(4.62, 0.22, 1.9);
  starPos[7] = vec3(-4.56, 1.60, -0.8);
  starPos[8] = vec3(-2.28, 4.01, -4.0);
  starPos[9] = vec3(-1.97, 3.78, -1.5);
  starPos[10] = vec3(-3.82, 6.65, 2.3);
  starPos[11] = vec3(2.85, -6.42, -6.2);
  starPos[12] = vec3(0.74, 0.02, 2.7);
  starPos[13] = vec3(-0.02, 3.71, 1.3);
  starPos[14] = vec3(3.16, 2.12, -4.2);
  starPos[15] = vec3(-3.34, 1.08, 0.5);
  starPos[16] = vec3(3.75, -2.31, 3.8);
  starPos[17] = vec3(-5.70, -0.95, -2.9);
  starPos[18] = vec3(0.60, 1.53, -0.1);
  starPos[19] = vec3(4.38, -3.68, 3.1);

  starBright[0] = 1.000;
  starBright[1] = 0.500;
  starBright[2] = 0.465;
  starBright[3] = 0.398;
  starBright[4] = 0.299;
  starBright[5] = 0.268;
  starBright[6] = 0.129;
  starBright[7] = 0.093;
  starBright[8] = 0.070;
  starBright[9] = 0.037;
  starBright[10] = 0.077;
  starBright[11] = 0.094;
  starBright[12] = 0.043;
  starBright[13] = 0.026;
  starBright[14] = 0.023;
  starBright[15] = 0.047;
  starBright[16] = 0.047;
  starBright[17] = 0.033;
  starBright[18] = 0.035;
  starBright[19] = 0.055;

  starColor[0] = vec3(0.72, 0.82, 1.00);
  starColor[1] = vec3(0.78, 0.86, 1.00);
  starColor[2] = vec3(0.68, 0.80, 1.00);
  starColor[3] = vec3(0.72, 0.82, 1.00);
  starColor[4] = vec3(0.68, 0.80, 1.00);
  starColor[5] = vec3(0.66, 0.78, 1.00);
  starColor[6] = vec3(0.78, 0.86, 1.00);
  starColor[7] = vec3(0.72, 0.82, 1.00);
  starColor[8] = vec3(0.78, 0.86, 1.00);
  starColor[9] = vec3(0.85, 0.90, 1.00);
  starColor[10] = vec3(0.78, 0.86, 1.00);
  starColor[11] = vec3(0.78, 0.86, 1.00);
  starColor[12] = vec3(0.82, 0.88, 1.00);
  starColor[13] = vec3(0.82, 0.88, 1.00);
  starColor[14] = vec3(0.85, 0.90, 1.00);
  starColor[15] = vec3(0.78, 0.86, 1.00);
  starColor[16] = vec3(0.82, 0.88, 1.00);
  starColor[17] = vec3(0.82, 0.88, 1.00);
  starColor[18] = vec3(0.80, 0.85, 1.00);
  starColor[19] = vec3(0.82, 0.88, 1.00);
}

#define CLUSTER_CENTER vec3(0.0, 0.8, 0.0)
#define ORBIT_RADIUS 14.0
#define ORBIT_SPEED 0.48
#define CAMERA_ZOOM 0.75

#define CORE_GAIN 0.150
#define HALO_GAIN 0.020
#define SPIKE_GAIN 0.003
#define SPIKE_LENGTH 400.0

#define NEBULA_STRENGTH 0.35

#define MW_STRENGTH 0.11
#define MW_BAND_WIDTH 18.0
#define MW_DUST_LANE 0.58
#define MW_STAR_DENSITY 0.95
#define MW_STAR_FOCUS 45.0
#define MW_STAR_BRIGHT 0.5

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
const vec3 WORLD_UP = vec3(0.0, 1.0, 0.0);
const vec3 GAL_NORTH = normalize(vec3(0.617, 0.679, 0.399));
const vec3 GAL_CENTER = normalize(vec3(-0.433, -0.130, 0.892));

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

struct Ray {
  vec3 o;
  vec3 d;
};

Ray setupCamera(vec2 uv, vec3 pos, vec3 lookAt, float zoom, vec3 upHint) {
  vec3 fwd = normalize(lookAt - pos);
  vec3 upRef = (abs(dot(fwd, upHint)) > 0.999) ? vec3(0.0, 0.0, 1.0) : upHint;
  vec3 right = normalize(cross(fwd, upRef));
  vec3 up = normalize(cross(right, fwd));
  vec3 img = pos + fwd * zoom + right * uv.x + up * uv.y;
  return Ray(pos, normalize(img - pos));
}

vec3 renderStar(Ray r, vec3 p, float brightness, vec3 color) {
  vec3 op = p - r.o;
  float t = dot(op, r.d);
  if (t < 0.0) {
    return vec3(0.0);
  }

  vec3 closest = r.o + r.d * t - p;
  float d2 = dot(closest, closest);

  float size = 0.08 + 0.35 * sqrt(brightness);
  float s2 = size * size;

  if (d2 > s2 * 800.0) {
    return vec3(0.0);
  }

  float core = CORE_GAIN * brightness / (d2 / s2 + 0.012);
  float halo = HALO_GAIN * brightness / (d2 / (s2 * 15.0) + 0.08);

  vec3 right = normalize(cross(r.d, WORLD_UP));
  vec3 up = normalize(cross(right, r.d));
  float sx = dot(closest, right);
  float sy = dot(closest, up);

  float spikes = 0.0;
  if (brightness > 0.05) {
    float spike1 = max(0.0, 1.0 - abs(sx * sy * SPIKE_LENGTH / s2));
    vec2 rot45 = vec2(sx + sy, sx - sy) * 0.7071;
    float spike2 = max(0.0, 1.0 - abs(rot45.x * rot45.y * SPIKE_LENGTH * 0.6 / s2));
    spikes = (spike1 + spike2 * 0.4) * SPIKE_GAIN * brightness;
    spikes *= smoothstep(size * 25.0, size * 2.0, sqrt(d2));
  }

  return color * (core + halo + spikes);
}

`;
