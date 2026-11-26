import type React from "react";

const GRADIENT_TEXT_STYLE: React.CSSProperties = {
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

interface BadgeStyleInput {
  badgeFontSize: string;
  badgeTextColor: string;
  badgeGradient: string;
}

const badgeColorStyle = ({
  badgeTextColor,
  badgeGradient,
}: BadgeStyleInput): React.CSSProperties => {
  if (badgeGradient) {
    return { backgroundImage: badgeGradient, ...GRADIENT_TEXT_STYLE };
  }
  return badgeTextColor ? { color: badgeTextColor } : {};
};

export const buildBadgeStyle = (input: BadgeStyleInput): React.CSSProperties => ({
  ...(input.badgeFontSize ? { fontSize: input.badgeFontSize } : {}),
  ...badgeColorStyle(input),
});
