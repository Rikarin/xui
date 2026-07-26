// This package is deliberately "type": "commonjs" (Nx generators load as CJS), so the
// jest config stays CJS too.
module.exports = {
  displayName: 'tools',
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/tools'
};
