import { __ } from "@wordpress/i18n";

export type AnimationTrigger = "scroll" | "reveal";

interface AnimationTypeDefinition {
  label: string;
  key: string;
}

const ANIMATION_TYPE_DEFINITIONS: AnimationTypeDefinition[] = [
  { label: __("No Animation", "kotlinskidev"), key: "" },
  { label: __("Appear", "kotlinskidev"), key: "appear" },
  { label: __("Fade In", "kotlinskidev"), key: "fade-in" },
  { label: __("Fade Up", "kotlinskidev"), key: "fade-up" },
  { label: __("Fade Left", "kotlinskidev"), key: "fade-left" },
  { label: __("Fade Right", "kotlinskidev"), key: "fade-right" },
  { label: __("Flip Up", "kotlinskidev"), key: "flip-up" },
  { label: __("Flip Down", "kotlinskidev"), key: "flip-down" },
  { label: __("Flip Left", "kotlinskidev"), key: "flip-left" },
  { label: __("Flip Right", "kotlinskidev"), key: "flip-right" },
];

export const ANIMATION_TRANSLATE_OPTIONS = [
  { label: __("Default Distance", "kotlinskidev"), value: "" },
  { label: __("Small (20px)", "kotlinskidev"), value: "translate-sm" },
  { label: __("Medium (40px)", "kotlinskidev"), value: "translate-md" },
  { label: __("Large (60px)", "kotlinskidev"), value: "translate-lg" },
  { label: __("Extra Large (80px)", "kotlinskidev"), value: "translate-xl" },
  { label: __("2X Large (100px)", "kotlinskidev"), value: "translate-2xl" },
];

export function buildAnimationTypeOptions(trigger: AnimationTrigger) {
  return ANIMATION_TYPE_DEFINITIONS.map(({ label, key }) => ({
    label,
    value: key === "" ? "" : `${key}-on-${trigger}`,
  }));
}

export function supportsDistanceControl(animationValue: string): boolean {
  return (
    animationValue !== "" &&
    !animationValue.includes("flip") &&
    !animationValue.startsWith("appear-on-")
  );
}
