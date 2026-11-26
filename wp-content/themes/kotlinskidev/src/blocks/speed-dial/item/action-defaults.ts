import { __ } from "@wordpress/i18n";
import type { SpeedDialAction } from "../types";

interface ActionDefaults {
  title: string;
  label: string;
  icon: string;
}

export const ACTION_DEFAULTS: Record<SpeedDialAction, ActionDefaults> = {
  phone: {
    title: __("Phone", "kotlinskidev"),
    label: __("Call us", "kotlinskidev"),
    icon: "phone",
  },
  email: {
    title: __("Email", "kotlinskidev"),
    label: __("Email us", "kotlinskidev"),
    icon: "mail",
  },
  accessibility: {
    title: __("Accessibility", "kotlinskidev"),
    label: __("Accessibility", "kotlinskidev"),
    icon: "accessibility",
  },
  url: { title: __("Link", "kotlinskidev"), label: __("Open link", "kotlinskidev"), icon: "link" },
  trigger: {
    title: __("Accessibility option", "kotlinskidev"),
    label: __("Accessibility option", "kotlinskidev"),
    icon: "sparkles",
  },
  custom: { title: __("Custom blocks", "kotlinskidev"), label: "", icon: "" },
};

export const ACTION_ORDER: SpeedDialAction[] = [
  "phone",
  "email",
  "accessibility",
  "url",
  "trigger",
  "custom",
];
