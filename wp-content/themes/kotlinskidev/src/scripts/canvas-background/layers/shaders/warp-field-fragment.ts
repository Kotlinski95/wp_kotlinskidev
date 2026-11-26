export const WARP_FIELD_FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_density;
uniform vec3 u_color;

float hash31(vec3 p) {
  return fract(sin(dot(p, vec3(10.9898, 70.233, 40.6474))) * 45758.5433);
}

float starnoise(vec3 rd, float density) {
  const vec3 amps = vec3(0.6, 0.45, 0.15);
  const vec4 cs = vec4(3.0 / 5.0, 4.0 / 5.0, 5.0 / 13.0, 12.0 / 13.0);
  const mat3 arbitraryRotAndScale = mat3(
    dot(amps, vec3(1.0, cs.x, cs.z)), amps.z * cs.w, amps.y * cs.y,
    -cs.w * amps.z, dot(amps, vec3(1.0, 1.0, cs.z)), 0.0,
    -cs.y * amps.y, 0.0, dot(amps, vec3(1.0, cs.x, 1.0))
  );

  float c = 0.0;
  vec3 p = rd * 300.0;
  for (float i = 0.0; i < 4.0; i += 1.0) {
    vec3 q = fract(p) - 0.5;
    vec3 id = floor(p);
    float c2 = smoothstep(0.25, 0.0, dot(q, q));
    c2 *= step(hash31(id), density * (0.02 - i * i * 0.002));
    c += c2;
    p = p * arbitraryRotAndScale;
  }
  c *= c;

  float g = dot(sin(rd * 12.12), cos(rd.yzx * 4.512));
  float d = smoothstep(-3.14159265359, -0.9, g) * 0.5 + 0.5 * smoothstep(-0.3, 1.0, g);
  c *= d * d * 0.5 + d * 0.5;
  return c * c;
}

void main() {
  float t = u_time * 0.001 * u_speed;
  float zoom = 2.0 - cos(t * 0.2);

  float angle = t * 0.05;
  float cy = cos(angle);
  float sy = sin(angle);
  mat3 rotateYaw = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);

  vec3 rd = normalize(vec3(gl_FragCoord.xy - u_resolution * 0.5, zoom * u_resolution.y)) * rotateYaw;

  float l = starnoise(rd, u_density);
  gl_FragColor = vec4(sqrt(l)) * vec4(u_color, 1.0);
}
`;
