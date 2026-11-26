import { mixRgb, rgba } from "../palette";
import { treeLayout } from "../geometry";
import type { DrawContext } from "../types";

const NODE_RADIUS = 9;

export const drawNodeTree = ({
  ctx,
  width,
  height,
  time,
  progress,
  palette,
}: DrawContext): void => {
  ctx.clearRect(0, 0, width, height);
  const { nodes, edges, activePath } = treeLayout(width, height);
  const isActiveEdge = (from: number, to: number): boolean =>
    activePath.includes(from) && activePath.includes(to);

  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  ctx.lineDashOffset = -time * 0.03 * progress;
  edges.forEach(([from, to]) => {
    const active = progress > 0 && isActiveEdge(from, to);
    ctx.strokeStyle = active
      ? rgba(mixRgb(palette.strong, palette.accent, progress), 0.95)
      : rgba(palette.strong, 0.5);
    ctx.beginPath();
    ctx.moveTo(nodes[from].x, nodes[from].y);
    ctx.lineTo(nodes[to].x, nodes[to].y);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  nodes.forEach((node, index) => {
    const active = progress > 0 && activePath.includes(index);
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = rgba(palette.surface, 1);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = active
      ? rgba(mixRgb(palette.strong, palette.accent, progress), 1)
      : rgba(palette.strong, 0.7);
    ctx.stroke();
    if (active) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.accentGlow, progress);
      ctx.fill();
    }
  });
};
