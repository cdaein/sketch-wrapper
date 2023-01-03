// /** @type {import('ts-jest').JestConfigWithTsJest} */

const config = {
  preset: "ts-jest",
  setupFiles: ["jest-canvas-mock"],
  testEnvironment: "jest-environment-jsdom",
};

export default config;
