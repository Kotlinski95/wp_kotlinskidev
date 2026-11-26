export const PLEIADES_DUST_AND_MILKY_WAY_SHADER = `#define DUST_CLOUD_RADIUS 14.0
#define DUST_STEPS 24
#define DUST_STEP_SIZE 0.8
#define NUM_ILLUMINATORS 7

float hash3d(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3d(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3d(i), hash3d(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash3d(i + vec3(0.0, 1.0, 0.0)), hash3d(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash3d(i + vec3(0.0, 0.0, 1.0)), hash3d(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash3d(i + vec3(0.0, 1.0, 1.0)), hash3d(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float dustDensity(vec3 p) {
  float d = 0.01;
  d += noise3d(p * 0.35) * 0.50;
  d += noise3d(p * 0.70 + 3.7) * 0.33;
  d += noise3d(p * 1.50 + 7.1) * 0.22;

  float r = length(p - CLUSTER_CENTER) / DUST_CLOUD_RADIUS;
  d *= smoothstep(1.0, 0.3, r);

  return max(d - 0.25, 0.05);
}

vec3 renderDustNebula(Ray r) {
  vec3 oc = r.o - CLUSTER_CENTER;
  float b = dot(oc, r.d);
  float c = dot(oc, oc) - DUST_CLOUD_RADIUS * DUST_CLOUD_RADIUS;
  float h = b * b - c;
  if (h < 0.0) {
    return vec3(0.0);
  }

  float tNear = max(-b - sqrt(h), 0.0);
  float tFar = -b + sqrt(h);
  if (tFar < 0.0) {
    return vec3(0.0);
  }

  vec3 scatter = vec3(0.0);
  float t = tNear;

  for (int i = 0; i < DUST_STEPS; i++) {
    if (t > tFar) {
      break;
    }
    vec3 pos = r.o + r.d * t;

    float dust = dustDensity(pos);
    if (dust > 0.001) {
      vec3 light = vec3(0.0);
      for (int s = 0; s < NUM_ILLUMINATORS; s++) {
        vec3 toStar = starPos[s] - pos;
        float dist2 = dot(toStar, toStar);
        light += pow(starColor[s], vec3(BLUEFACTOR)) * starBright[s] / (dist2 + 0.5);
      }
      vec3 scattered = light * vec3(0.55, 0.75, 1.00);
      scatter += dust * scattered * DUST_STEP_SIZE;
    }
    t += DUST_STEP_SIZE;
  }

  return scatter * NEBULA_STRENGTH;
}

float noise2d(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm2d(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 drift = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    v += a * noise2d(p);
    p = drift * p * 2.0 + 1.7;
    a *= 0.5;
  }
  return v;
}

vec3 milkyWay(vec3 rd) {
  float sinB = dot(rd, GAL_NORTH);
  float galLat = asin(clamp(sinB, -1.0, 1.0));

  float band = exp(-galLat * galLat * MW_BAND_WIDTH);
  band += 0.6 * exp(-galLat * galLat * MW_BAND_WIDTH * 4.0);

  if (band < 0.005) {
    return vec3(0.0);
  }

  float dustLane = 1.0 - MW_DUST_LANE * exp(-galLat * galLat * MW_BAND_WIDTH * 20.0);

  vec3 inPlane = normalize(rd - sinB * GAL_NORTH);
  vec3 galPerp = normalize(cross(GAL_NORTH, GAL_CENTER));
  float galLon = atan(dot(inPlane, galPerp), dot(inPlane, GAL_CENTER));

  float lonBright = 0.60 + 0.40 * (0.5 + 0.5 * cos(galLon));

  vec2 nCoord = vec2(galLon * 3.0, galLat * 10.0);
  float clouds = fbm2d(nCoord * 2.5 + 42.0);
  float largeClouds = fbm2d(nCoord * 0.8 + 17.0);

  float structure = (0.5 + 0.5 * clouds) * (0.6 + 0.4 * largeClouds);

  float centerFade = exp(-galLat * galLat * MW_BAND_WIDTH * 2.0);
  vec3 mwColor = mix(
    vec3(0.565, 0.670, 0.880),
    vec3(0.95, 0.61, 0.50),
    centerFade
  );

  return mwColor * band * dustLane * lonBright * structure * MW_STRENGTH;
}

`;
