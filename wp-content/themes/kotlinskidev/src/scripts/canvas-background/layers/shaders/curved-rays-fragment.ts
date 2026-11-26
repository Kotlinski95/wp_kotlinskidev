export const CURVED_RAYS_FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_rayCount;
uniform float u_speed;
uniform vec3 u_color;

vec2 cubicBezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {
  float s = 1.0 - t;
  return s * s * s * p0 + 3.0 * s * s * t * p1 + 3.0 * s * t * t * p2 + t * t * t * p3;
}

float distanceToBezier(vec2 point, vec2 p0, vec2 p1, vec2 p2, vec2 p3, out float closestT) {
  float minDist = 1e10;
  closestT = 0.0;

  const int samples = 24;
  for (int i = 0; i <= samples; i++) {
    float t = float(i) / float(samples);
    float dist = distance(point, cubicBezier(p0, p1, p2, p3, t));
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }

  float tMin = max(0.0, closestT - 0.03);
  float tMax = min(1.0, closestT + 0.03);
  for (int i = 0; i <= 6; i++) {
    float t = tMin + (tMax - tMin) * float(i) / 6.0;
    float dist = distance(point, cubicBezier(p0, p1, p2, p3, t));
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }

  return minDist;
}

void main() {
  float topWidth = 0.15;
  float bottomWidth = 1.0;
  float verticalLength = 0.45;
  float rayWidth = 0.005;
  float pulseWidth = 0.03;
  float trailLength = 0.5;
  float motionBlur = 0.3;
  float bgGlow = 1.2;
  float glowSpread = 1.0;
  float glowCurve = 0.2;

  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  float timeSeconds = u_time * 0.001 * u_speed;

  vec3 totalPulseColor = vec3(0.0);
  vec3 backgroundGlow = vec3(0.0);
  float rayCount = clamp(u_rayCount, 1.0, 32.0);

  for (float i = 0.0; i < 32.0; i += 1.0) {
    if (i >= rayCount) {
      break;
    }

    float rayIndex = i / max(1.0, rayCount - 1.0);
    float xStart = 0.5 + (rayIndex - 0.5) * topWidth;
    float centerOffset = rayIndex - 0.5;

    vec2 p0 = vec2(xStart, 0.0);
    vec2 p3 = vec2(0.5 + centerOffset * bottomWidth, 1.0);
    float targetOffset = centerOffset * bottomWidth;
    vec2 p1 = vec2(0.5 + targetOffset * 0.25, verticalLength + 0.35);
    vec2 p2 = vec2(0.5 + targetOffset * 0.0, 0.55);

    float closestT;
    float dist = distanceToBezier(uv, p0, p1, p2, p3, closestT);

    float widthAtT = mix(topWidth, bottomWidth, closestT);
    float widthScale = widthAtT / max(topWidth, bottomWidth);
    float scaledRayWidth = rayWidth * widthScale;

    float rayGlow = exp(-dist / scaledRayWidth);
    rayGlow = smoothstep(0.0, 0.1, rayGlow) * rayGlow;

    vec3 rayColor = mix(u_color, u_color * 0.6, uv.y);

    for (float p = 0.0; p < 2.0; p += 1.0) {
      float pulseTime = timeSeconds + i * 0.2 + p * 0.9;
      float pulsePos = fract(pulseTime);
      float pulseDist = abs(closestT - pulsePos);

      float pulseWidthAtT = mix(topWidth, bottomWidth, pulsePos);
      float pulseWidthScale = pulseWidthAtT / max(topWidth, bottomWidth);
      float scaledPulseWidth = pulseWidth * pulseWidthScale;

      float pulse = exp(-pulseDist / scaledPulseWidth) * rayGlow;

      float trailDist = pulsePos - closestT;
      if (trailDist > 0.0 && trailDist < trailLength) {
        float trailFade = (1.0 - trailDist / trailLength) * 0.3;
        pulse += trailFade * rayGlow;

        for (int b = 0; b < 3; b++) {
          float blurOffset = trailDist * float(b) / 3.0;
          float blurFade = exp(-blurOffset / (trailLength * 0.5)) * motionBlur;
          pulse += blurFade * rayGlow * 0.2;
        }
      }

      pulse *= smoothstep(1.0, 0.8, pulsePos);
      totalPulseColor += rayColor * pulse;
    }

    float bgGlowDist = dist / (rayWidth * 10.0);
    float baseGlowIntensity = exp(-bgGlowDist) * bgGlow * 0.15;
    float spreadWeight = smoothstep(0.3, 1.0, closestT) * glowSpread;
    float curveWeight = exp(-pow((closestT - 0.5) * 3.0, 2.0)) * glowCurve;
    float glowWeight = spreadWeight + curveWeight;

    backgroundGlow += rayColor * (baseGlowIntensity * glowWeight);
  }

  float yFade = smoothstep(0.0, 0.15, uv.y);
  vec3 finalColor = totalPulseColor * yFade;
  finalColor += backgroundGlow;

  float vignette = 1.0 - smoothstep(0.7, 1.2, length(uv - vec2(0.5)));
  finalColor *= vignette * 0.3 + 0.7;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
