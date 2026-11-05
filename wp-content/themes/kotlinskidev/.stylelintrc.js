module.exports = {
  extends: "@wordpress/stylelint-config/scss-stylistic",
  rules: {
    "selector-class-pattern": null,
    // This codebase groups selectors of deliberately mixed specificity by
    // design: dark/light-mode variants declared after base rules, and large
    // grouped overrides for third-party plugin markup (Complianz, etc.) whose
    // DOM varies in ID vs. class structure. The rule can't tell that apart
    // from an actual specificity bug, so it's pure noise here.
    "no-descending-specificity": null,
  },
};
