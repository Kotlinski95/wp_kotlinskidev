module.exports = {
  preset: "@wordpress/jest-preset-default",
  testEnvironmentOptions: {
    url: "http://example.test/",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@node_modules/(.*)$": "<rootDir>/node_modules/$1",
  },
  transformIgnorePatterns: ["node_modules/(?!.*(@wordpress|uuid)/)"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
    "\\.mjs$": "babel-jest",
  },
};
