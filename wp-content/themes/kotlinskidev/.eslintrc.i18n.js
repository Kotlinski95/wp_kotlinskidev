module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
  plugins: ["react", "@typescript-eslint", "no-unsanitized"],
  rules: {
    "react/jsx-no-literals": [
      "warn",
      {
        noStrings: true,
        allowedStrings: ["", "-", "|", "&middot;", "&nbsp;", " ", "+", "×", "→", "↑", "▼", "K"],
        ignoreProps: true,
        noAttributeStrings: false,
      },
    ],
  },
};
