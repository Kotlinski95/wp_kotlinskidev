module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["plugin:security/recommended-legacy", "plugin:no-unsanitized/DOM"],
  env: {
    browser: true,
    es2021: true,
  },
};
