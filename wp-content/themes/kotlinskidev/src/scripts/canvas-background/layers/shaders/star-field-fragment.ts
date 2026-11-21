export const STAR_FIELD_FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_layerCount;
uniform vec3 u_color;

#define TAU 6.283185
#define SPEED_SCALE 10.0

float safeSin(float x) {
  return sin(mod(x, TAU));
}

float hash1(vec2 p) {
  return fract(safeSin(p.x * 997.0 + p.y * 9011.0) * 1051.0);
}

float hash2(vec2 p) {
  return fract(safeSin(p.x * 99119.0 + p.y * 104729.0) * 10151.0);
}

float hash3(vec2 p) {
  return fract(safeSin(p.x * 499.0 + p.y * 78779.0) * 23819.0);
}

float hash4(vec2 p) {
  return fract(safeSin(p.x * 20747.0 + p.y * 90887.0) * 14543.0);
}

float star(vec2 uv, float radius, float flare) {
  float d = length(uv);
  float col = 0.01 / d;
  float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  col += rays * flare;
  col *= smoothstep(radius, 0.0, d);
  return col;
}

float starField(vec2 uv) {
  vec2 localUv = fract(uv + 0.5) - 0.5;
  vec2 cellId = floor(uv + 0.5);
  float brightness = 0.0;

  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 offset = vec2(float(x), float(y));
      float present = hash1(cellId + offset);
      if (present < 0.09) {
        float jitterX = hash2(cellId + offset);
        float jitterY = hash3(cellId + offset);
        float flare = hash4(cellId + offset);
        brightness += star(localUv - offset + vec2(jitterX, jitterY), flare, 1.0);
      }
    }
  }

  return brightness;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float timeSeconds = u_time * 0.001 * u_speed;
  float layerCount = clamp(u_layerCount, 3.0, 12.0);

  vec3 col = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    if (float(i) >= layerCount) {
      break;
    }
    float layer = float(i) / layerCount;
    float depth = fract(layer - timeSeconds / SPEED_SCALE);
    float scale = mix(20.0, 0.1, depth);
    float fade = smoothstep(0.1, 0.5, depth);
    col += vec3(starField(uv * scale + layer * 1123.0) * fade);
  }

  if (timeSeconds < SPEED_SCALE) {
    float introScale = 1.0 + mix(20.0, 0.1, fract(-timeSeconds / SPEED_SCALE));
    col += vec3(star(uv * introScale, 1.0, 1.0));
  }

  gl_FragColor = vec4(col * u_color, 1.0);
}
`;
