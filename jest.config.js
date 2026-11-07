const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/tests/security/", "/.firebase/"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};