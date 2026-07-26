/**
 * Stub for `xhr2`.
 *
 * `@angular/platform-server` lazily does `await import('xhr2')` to back `HttpClient` when it is
 * configured with the XHR backend. On a neutral (edge) build Angular deliberately leaves that
 * import external because `xhr2` is a Node module — which leaves Wrangler with an import it cannot
 * resolve, and the Worker fails to bundle.
 *
 * The docs app never injects `HttpClient`, so the import is dead weight; alias it away. If a caller
 * ever does reach for HTTP on the server, `withFetch()` is the answer on Workers, not XHR — hence
 * the loud throw rather than a silent no-op.
 */
export default class XMLHttpRequest {
  constructor() {
    throw new Error('xhr2 is not available on Cloudflare Workers. Configure HttpClient with `withFetch()`.');
  }
}
