/**
 * Make `@angular/platform-server` usable under Jest.
 *
 * Jest compiles the domino bundle to CommonJS, which marks it `__esModule` and
 * puts the library on `exports.default`. But the Angular `.mjs` files that
 * import it are compiled with Node's ESM interop — `__toESM(mod, 1)` — and that
 * mode ignores `__esModule` and hands the importer the module object whole. So
 * `domino.impl` reads back as `undefined` and the platform dies on
 * `domino.impl.Event` before a single component renders. Without this nothing in
 * the library can be tested against a real server render at all.
 *
 * Re-exporting the default as the module body itself lands both interop
 * spellings on the same object.
 *
 * The path is relative, and deliberately so: `third_party` is not in the
 * package's `exports` map, so a bare specifier does not resolve from here, and a
 * relative one also cannot match the mapping that routes to this file — which
 * would recurse.
 */
module.exports = require('../../node_modules/@angular/platform-server/third_party/domino/bundled-domino.mjs').default;
