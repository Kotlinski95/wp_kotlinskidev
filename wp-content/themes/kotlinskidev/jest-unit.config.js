const defaultConfig = require("@wordpress/scripts/config/jest-unit.config.js");

module.exports = {
  ...defaultConfig,
  moduleNameMapper: {
    ...defaultConfig.moduleNameMapper,
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@node_modules/(.*)$": "<rootDir>/node_modules/$1",
    "\\.(scss|css)$": "<rootDir>/jest.style-mock.js",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/types/**", "!src/**/types.ts"],
  coverageDirectory: "<rootDir>/coverage/js",
  transformIgnorePatterns: ["node_modules/(?!.*(uuid)/)"],
  setupFilesAfterEnv: [
    require.resolve("@wordpress/jest-preset-default/scripts/setup-test-framework.js"),
    require.resolve("@testing-library/jest-dom"),
    "<rootDir>/jest.setup.ts",
  ],
};
