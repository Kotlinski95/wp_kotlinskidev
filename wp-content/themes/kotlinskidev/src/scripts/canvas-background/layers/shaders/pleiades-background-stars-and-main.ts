export const PLEIADES_BACKGROUND_STARS_AND_MAIN_SHADER = `float procStar(vec2 uv, float flare, float blur) {
  float d = length(uv);
  float m = 0.00008 / max(d * d, 0.00001 * blur);

  float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1200.0));
  m += rays * flare * 0.015;
  uv *= rot(PI * 0.25);
  rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1200.0));
  m += rays * flare * 0.3 * 0.015;

  m *= smoothstep(1.0, 0.15, d);
  return m;
}

vec3 bgStarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      float n = hash21(id + offs);
      float size = fract(n * 345.32);
      if (size < 0.1) {
        continue;
      }
      float flare = smoothstep(0.9, 1.0, size) * 0.5;
      vec2 starOff = vec2(n, fract(n * 34.0));
      vec2 localUV = gv - offs - starOff + 0.5;
      float s = procStar(localUV / 2.0, flare, 1.0);
      vec3 tint = mix(vec3(1.0, 0.85, 0.7), vec3(0.7, 0.85, 1.0), fract(n * 123.45));
      col += tint * s * size * 0.06;
    }
  }
  return col * vec3(0.67, 0.67, 1.0) * 1.2;
}

vec2 dirToOctUV(vec3 n) {
  n /= (abs(n.x) + abs(n.y) + abs(n.z));
  vec2 uv = n.xz;
  if (n.y < 0.0) {
    uv = (1.0 - abs(uv.yx)) * sign(uv.xy);
  }
  return uv;
}

vec3 shellStarField(Ray r, vec3 center, float radius, float scale, float brightness, vec2 offset) {
  vec3 oc = r.o - center;
  float b = dot(oc, r.d);
  float h = b * b - dot(oc, oc) + radius * radius;
  if (h < 0.0) {
    return vec3(0.0);
  }

  float t = -b + sqrt(h);
  vec3 hit = r.o + r.d * t;
  vec3 localDir = normalize(hit - center);

  vec2 uv = dirToOctUV(localDir) * scale + offset;
  return bgStarLayer(uv) * brightness;
}

vec3 mwStarLayer(vec2 uv, vec3 rd, vec2 resolution) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  float sinB = dot(rd, GAL_NORTH);
  float absB = abs(sinB);
  float galWeight = smoothstep(1.0 / sqrt(MW_STAR_FOCUS), 0.0, absB);

  vec3 inPlane = normalize(rd - sinB * GAL_NORTH);
  vec3 galPerp = normalize(cross(GAL_NORTH, GAL_CENTER));
  float galLon = atan(dot(inPlane, galPerp), dot(inPlane, GAL_CENTER));
  float lonWeight = 0.5 + 0.5 * (0.5 + 0.5 * cos(galLon));

  float density = galWeight * lonWeight;
  if (density < 0.01) {
    return vec3(0.0);
  }

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      float n = hash21(id + offs);
      float threshold = (1.0 - MW_STAR_DENSITY) - MW_STAR_DENSITY * density;
      float size = fract(n * 345.32);
      if (size < threshold) {
        continue;
      }
      float flare = smoothstep(0.92, 1.0, size) * 0.4;
      vec2 starOff = vec2(n, fract(n * 34.0));
      vec2 localUV = gv - offs - starOff + 0.5;
      float s = procStar(localUV / 1.8, flare, 3333.0 * (3.33 / resolution.y));
      vec3 tint = mix(vec3(1.0, 0.80, 0.60), vec3(0.80, 0.85, 1.0), fract(n * 123.45));
      col += tint * s * size * MW_STAR_BRIGHT * galWeight;
    }
  }
  return col * 1.33;
}

vec3 mwShellStars(Ray r, vec3 center, float radius, float scale, float brightness, vec2 offset, vec2 resolution) {
  vec3 oc = r.o - center;
  float b = dot(oc, r.d);
  float h = b * b - dot(oc, oc) + radius * radius;
  if (h < 0.0) {
    return vec3(0.0);
  }

  float t = -b + sqrt(h);
  vec3 hit = r.o + r.d * t;
  vec3 localDir = normalize(hit - center);

  vec2 uv = dirToOctUV(localDir) * scale + offset;
  return mwStarLayer(uv, r.d, resolution) * brightness * 1.5;
}

vec3 backgroundStars(Ray r, vec2 resolution) {
  vec3 col = vec3(0.0);
  col += shellStarField(r, CLUSTER_CENTER, 40.0, 12.0, 2.3, vec2(57.3, 124.9));
  col += shellStarField(r, CLUSTER_CENTER, 80.0, 16.0, 0.9, vec2(173.7, 91.4));
  col += shellStarField(r, CLUSTER_CENTER, 160.0, 24.0, 0.7, vec2(311.7, 207.4));

  col += mwShellStars(r, CLUSTER_CENTER, 180.0, 60.0, 1.33, vec2(42.1, 218.3), resolution);
  col += mwShellStars(r, CLUSTER_CENTER, 280.0, 120.0, 0.70, vec2(287.5, 63.9), resolution);
  return col;
}

void main() {
  initStars();

  vec2 uv = gl_FragCoord.xy / u_resolution.xy - 0.5;
  uv.y *= u_resolution.y / u_resolution.x;

  float t = u_time * 0.001 * u_speed;
  float time = (t - 4.0) * ORBIT_SPEED;

  vec3 galX = normalize(GAL_CENTER - GAL_NORTH * dot(GAL_CENTER, GAL_NORTH));
  vec3 galY = normalize(cross(GAL_NORTH, galX));

  float a = time * 0.35;
  vec3 planeDir = normalize(cos(a) * galX + sin(a) * galY);

  vec3 camPos = CLUSTER_CENTER + planeDir * ORBIT_RADIUS + GAL_NORTH * ORBIT_RADIUS * 0.20;
  vec3 lookAt = CLUSTER_CENTER + planeDir * ORBIT_RADIUS * 0.35;

  Ray r = setupCamera(uv, camPos, lookAt, CAMERA_ZOOM, WORLD_UP);

  vec3 col = vec3(0.0);

  col += milkyWay(r.d);
  col += backgroundStars(r, u_resolution);
  col += renderDustNebula(r);

  for (int i = 0; i < NUM_STARS; i++) {
    col += renderStar(r, starPos[i], starBright[i], starColor[i]);
  }

  col *= u_intensity;
  col = col / (col + 1.0);
  col *= u_color;

  gl_FragColor = vec4(col, 1.0);
}
`;
