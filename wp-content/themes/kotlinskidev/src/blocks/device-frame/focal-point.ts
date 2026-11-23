import type { FocalPoint } from "@wordpress/components";

const DEFAULT_FOCAL_POINT: FocalPoint = { x: 0.5, y: 0.5 };

export function parseObjectPosition(value: string): FocalPoint {
  const match = value.match(/^(-?\d{1,3})% (-?\d{1,3})%$/);
  if (!match) {
    return DEFAULT_FOCAL_POINT;
  }
  return { x: Number(match[1]) / 100, y: Number(match[2]) / 100 };
}

export function formatObjectPosition(point: FocalPoint): string {
  return `${Math.round(point.x * 100)}% ${Math.round(point.y * 100)}%`;
}
