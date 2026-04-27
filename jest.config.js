/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node10",
          esModuleInterop: true,
          allowJs: true,
          strict: true,
          skipLibCheck: true,
          target: "ES2017",
          rootDir: ".",
          ignoreDeprecations: "6.0",
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  testPathIgnorePatterns: [
    // wallet-types.test.ts uses tsc --noEmit as its runner, not Jest
    "<rootDir>/__tests__/wallet-types.test.ts",
  ],
};

module.exports = config;
