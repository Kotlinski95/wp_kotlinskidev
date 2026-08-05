module.exports = {
  root: true,
  extends: [
    "plugin:@wordpress/eslint-plugin/recommended",
    "plugin:security/recommended-legacy",
    "plugin:no-unsanitized/DOM",
  ],
  env: {
    browser: true,
  },
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    // Sampled every current instance of both rules across the codebase: all
    // were numeric loop/array indices, TypeScript-narrowed finite unions, or
    // (for detect-unsafe-regex) patterns empirically timed against 50-100k
    // char adversarial input with no slowdown. Both rules stay enabled in
    // `security:sast` (.eslintrc.security.js) for periodic dedicated review,
    // where some false-positive noise is an acceptable tradeoff for not
    // missing a real future issue — just not on every routine `lint:js` run.
    "security/detect-object-injection": "off",
    "security/detect-unsafe-regex": "off",
    // No stable alternative exists yet at the installed package versions
    // (checked node_modules directly) — this is the documented WP-endorsed
    // way to knowingly accept a specific experimental API's risk rather than
    // silently using it or blanket-disabling the rule for future usage too.
    "@wordpress/no-unsafe-wp-apis": [
      "error",
      {
        "@wordpress/components": ["__experimentalNumberControl", "__experimentalUnitControl"],
        "@wordpress/block-editor": ["__experimentalColorGradientControl"],
      },
    ],
  },
  overrides: [
    {
      // Intentional styled console banner (devtools easter egg), not debug leftovers.
      files: ["src/index.ts"],
      rules: {
        "no-console": "off",
      },
    },
    {
      // Plain frontend scripts with no React node refs or editor-iframe context —
      // the ownerDocument alternative this rule suggests doesn't apply here at all.
      files: ["src/scripts/**", "src/utils/**"],
      rules: {
        "@wordpress/no-global-active-element": "off",
      },
    },
    {
      // Reveals editor-authored block content (RSA-decrypted server-side), the same
      // trust boundary as WordPress's own `the_content` — rendering HTML here is by
      // design, matching the block's own isHtmlMode feature.
      files: ["src/scripts/protected-content.ts"],
      rules: {
        "no-unsanitized/property": "off",
      },
    },
    {
      // insertAdjacentHTML content already runs through this file's own
      // escapeAttribute() helper before interpolation; the rule can't see custom
      // sanitizer functions.
      files: ["src/blocks/gallery-lightbox/init.ts"],
      rules: {
        "no-unsanitized/method": "off",
      },
    },
    {
      // onMouseDown here only calls preventEditorBlur() to stop the RichText
      // selection from blurring when this popover is clicked — a focus-management
      // guard, not a real click/keyboard interaction, so role/tabIndex/key handlers
      // don't make sense to add.
      files: ["src/formats/gradient-highlight/index.tsx"],
      rules: {
        "jsx-a11y/no-static-element-interactions": "off",
      },
    },
  ],
};
