import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
});

/**
 * jsdom has no canvas implementation, so `getContext('2d')` returns `null` and
 * Konva throws the moment it draws. These specs assert on the scene graph
 * rather than on pixels, so a permissive stub — every method a no-op, every
 * property writable — is all they need.
 */
const RESULTS: Record<string, () => unknown> = {
  measureText: () => ({ width: 0 }),
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  createLinearGradient: () => ({ addColorStop: () => undefined }),
  createRadialGradient: () => ({ addColorStop: () => undefined }),
  createPattern: () => null
};

HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
  return new Proxy({ canvas: this } as Record<string, unknown>, {
    get: (target, prop: string) => {
      if (prop in RESULTS) {
        return RESULTS[prop];
      }

      return prop in target ? target[prop] : (target[prop] = () => undefined);
    },
    set: (target, prop: string, value) => {
      target[prop] = value;

      return true;
    }
  });
} as HTMLCanvasElement['getContext'];
