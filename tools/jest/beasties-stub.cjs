/**
 * Stand in for the CSS inliner `@angular/ssr` bundles.
 *
 * `@angular/ssr` imports `../third_party/beasties/index.js`, which is ESM inside
 * `node_modules` and so goes untransformed under Jest — importing anything from
 * `@angular/ssr` dies on its `export` keyword before a single line runs. The
 * import exists for critical-CSS inlining, which is a build-time concern and
 * never reached by `provideServerRendering()`, so a stub costs nothing and is
 * what makes the package loadable in a spec at all.
 */
module.exports = class Beasties {
  process(html) {
    return Promise.resolve(html);
  }
};
