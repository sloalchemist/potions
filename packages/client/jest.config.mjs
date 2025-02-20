export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFiles: ['jest-canvas-mock', '<rootDir>/test/testSetup.ts'],
  testMatch: ['**/test/**/*.test.ts'],
  moduleNameMapper: {
    '^phaser$': 'phaser/dist/phaser.js'
  }
};
