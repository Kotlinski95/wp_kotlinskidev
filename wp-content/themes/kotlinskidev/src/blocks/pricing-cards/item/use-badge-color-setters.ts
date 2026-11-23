import { useRef } from "react";

interface BadgeColorValues {
  badgeTextColor: string;
  badgeGradient: string;
}

interface BadgeColorSetters {
  setBadgeTextColor: (value?: string) => void;
  setBadgeGradient: (value?: string) => void;
}

export const useBadgeColorSetters = (
  { badgeTextColor, badgeGradient }: BadgeColorValues,
  setAttributes: (attrs: BadgeColorValues) => void
): BadgeColorSetters => {
  const badgeTextColorRef = useRef(badgeTextColor);
  badgeTextColorRef.current = badgeTextColor;
  const badgeGradientRef = useRef(badgeGradient);
  badgeGradientRef.current = badgeGradient;

  const commit = (): void =>
    setAttributes({
      badgeTextColor: badgeTextColorRef.current,
      badgeGradient: badgeGradientRef.current,
    });

  const setBadgeTextColor = (value?: string): void => {
    badgeTextColorRef.current = value || "";
    if (value) {
      badgeGradientRef.current = "";
    }
    commit();
  };

  const setBadgeGradient = (value?: string): void => {
    badgeGradientRef.current = value || "";
    if (value) {
      badgeTextColorRef.current = "";
    }
    commit();
  };

  return { setBadgeTextColor, setBadgeGradient };
};
