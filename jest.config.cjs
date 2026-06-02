/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^\\.\\/convex\\/_generated\\/api$': '<rootDir>/tests/__mocks__/convex-api.ts',
    '^.*/convex/_generated/api$': '<rootDir>/tests/__mocks__/convex-generated-api.ts',
    '^convex/browser$': '<rootDir>/tests/__mocks__/convex-browser.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!convex/)'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'convex/lib/**/*.ts',
    'vite-otp-store.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testTimeout: 15000,
}
