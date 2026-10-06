const tsParser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const noUnsanitized = require("eslint-plugin-no-unsanitized");

module.exports = [
  {
    files: ["**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { react, "no-unsanitized": noUnsanitized },
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
  },
];
