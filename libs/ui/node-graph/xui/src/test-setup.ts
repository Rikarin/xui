import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
});

// jsdom implements neither of these, and the graph depends on both: nodes watch
// their own box to know when connectors moved, and every drag gesture captures
// the pointer so it keeps receiving events once it leaves the element.
globalThis.ResizeObserver ??= class {
  observe(): void {
    /* no layout in jsdom, so nothing ever fires */
  }
  unobserve(): void {}
  disconnect(): void {}
} as unknown as typeof ResizeObserver;

Element.prototype.setPointerCapture ??= function setPointerCapture() {};
Element.prototype.releasePointerCapture ??= function releasePointerCapture() {};
