const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    // See the shim for why @angular/platform-server cannot load its own DOM here.
    '^\\.\\./third_party/domino/bundled-domino\\.mjs$': require.resolve('./tools/jest/domino-default-interop.cjs'),
    // See the stub for why @angular/ssr cannot bring its own CSS inliner here.
    '^\\.\\./third_party/beasties/index\\.js$': require.resolve('./tools/jest/beasties-stub.cjs')
  }
};
