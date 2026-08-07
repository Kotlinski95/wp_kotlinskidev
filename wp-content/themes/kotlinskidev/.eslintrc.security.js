module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["plugin:security/recommended-legacy", "plugin:no-unsanitized/DOM"],
  env: {
    browser: true,
    es2021: true,
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
};
