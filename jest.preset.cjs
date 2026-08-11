const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    // See the shim for why @angular/platform-server cannot load its own DOM here.
    '^\\.\\./third_party/domino/bundled-domino\\.mjs$': require.resolve('./tools/jest/domino-default-interop.cjs')
  }
};
