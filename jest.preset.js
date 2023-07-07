const nxPreset = require('@nx/jest/preset');

module.exports = {
  ...nxPreset,

  setupFilesAfterEnv: ['<rootDir>/test/test-setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      isolatedModules: true
    }
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  // moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  // resolver: 'jest-preset-angular/build/resolvers/ng-jest-resolver.js',
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': 'jest-preset-angular'
  }
};
