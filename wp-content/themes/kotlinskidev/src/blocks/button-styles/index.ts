import { registerBlockStyle } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";

registerBlockStyle("core/button", {
  name: "gradient-outline",
  label: __("Gradient Outline", "kotlinskidev"),
});
