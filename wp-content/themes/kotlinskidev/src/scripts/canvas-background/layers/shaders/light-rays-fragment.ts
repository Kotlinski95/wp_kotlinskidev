export const LIGHT_RAYS_FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_rayCount;
uniform float u_speed;
uniform vec3 u_color;

float rayGlow(vec2 origin, vec2 direction, vec2 coord, float freqA, float freqB, float timeSeconds, float raySpeed) {
  vec2 toOrigin = coord - origin;
  float cosAngle = dot(normalize(toOrigin), direction);

  float shimmer =
    (0.45 + 0.15 * sin(cosAngle * freqA + timeSeconds * raySpeed)) +
    (0.3 + 0.2 * cos(-cosAngle * freqB + timeSeconds * raySpeed));

  float reach = clamp((u_resolution.x - length(toOrigin)) / u_resolution.x, 0.5, 1.0);

  return clamp(shimmer, 0.0, 1.0) * reach;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  float timeSeconds = u_time * 0.001;
  float freqScale = u_rayCount / 8.0;

  vec2 originA = vec2(u_resolution.x * 0.7, u_resolution.y * -0.4);
  vec2 directionA = normalize(vec2(1.0, -0.116));
  float glowA = rayGlow(
    originA,
    directionA,
    coord,
    36.2214 * freqScale,
    21.11349 * freqScale,
    timeSeconds,
    1.5 * u_speed
  );

  vec2 originB = vec2(u_resolution.x * 0.8, u_resolution.y * -0.6);
  vec2 directionB = normalize(vec2(1.0, 0.241));
  float glowB = rayGlow(
    originB,
    directionB,
    coord,
    22.3991 * freqScale,
    18.0234 * freqScale,
    timeSeconds,
    1.1 * u_speed
  );

  vec3 color = u_color * (glowA * 0.5 + glowB * 0.4);

  float brightness = 1.0 - (coord.y / u_resolution.y);
  color *= 0.1 + brightness * 0.9;

  gl_FragColor = vec4(color, 1.0);
}
`;
