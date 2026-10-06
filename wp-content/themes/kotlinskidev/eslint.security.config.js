const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");
const securityPlugin = require("eslint-plugin-security");
const noUnsanitized = require("eslint-plugin-no-unsanitized");

module.exports = [
  { files: ["**/*.ts", "**/*.tsx"] },
  securityPlugin.configs.recommended,
  noUnsanitized.configs.recommended,
  {
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      "no-unsanitized/property": [
        "error",
        {},
        {
          innerHTML: {
            escape: {
              methods: ["DOMPurify.sanitize"],
            },
          },
          outerHTML: {},
        },
      ],
      "no-unsanitized/method": [
        "error",
        {},
        {
          insertAdjacentHTML: {
            properties: [1],
            escape: {
              methods: ["DOMPurify.sanitize"],
            },
          },
          write: {
            objectMatches: ["document"],
            properties: [0],
          },
          writeln: {
            objectMatches: ["document"],
            properties: [0],
          },
        },
      ],
    },
  },
];
