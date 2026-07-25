import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
});

// jsdom implements neither of these, and the graph depends on both: nodes watch
// their own box to know when connectors moved, and every drag gesture captures
// the pointer so it keeps receiving events once it leaves the element.
const noop = () => undefined;

globalThis.ResizeObserver ??= class {
  // jsdom never lays anything out, so an observer here can only ever be inert.
  readonly observe = noop;
  readonly unobserve = noop;
  readonly disconnect = noop;
} as unknown as typeof ResizeObserver;

Element.prototype.setPointerCapture ??= noop;
Element.prototype.releasePointerCapture ??= noop;
