export const ORBIT_TRAILS_VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const ORBIT_TRAILS_MAIN_FRAGMENT_SHADER = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform float u_speed;
uniform float u_decay;
uniform vec3 u_color;
uniform sampler2D u_previousFrame;

float sdf(vec2 uv, float t) {
  float screenBorder = length(uv - 0.5 + vec2(sin(t * 3.0) * 0.5, cos(t * 3.0) * 0.5)) * 3.0;
  float orbit = distance(
    uv - 0.5,
    vec2(sin(t * 3.0) * 0.2 + cos(t * 3.0) * 0.1 * sin(t * t), cos(t * 3.0) * 0.2)
  ) * 8.0;
  return min(screenBorder, orbit);
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.001 * u_speed;

  float glow = smoothstep(0.0, 15.0, 1.0 - sdf(uv, t));
  vec4 tint = vec4(u_color, 1.0) * (vec4(sin(t * 2.0), cos(t * 2.0), 0.0, 0.0) + 2.3);
  vec4 trail = texture2D(u_previousFrame, uv) * u_decay;

  gl_FragColor = vec4(glow) * tint + trail;
}
`;

export const ORBIT_TRAILS_OUTPUT_FRAGMENT_SHADER = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_frame;
void main() {
  gl_FragColor = texture2D(u_frame, v_uv);
}
`;
