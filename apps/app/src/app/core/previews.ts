import { InjectionToken, type Provider, type Type } from '@angular/core';

/** Preview module loaders, by component slug. The generated `previews.ts` is one of these. */
export type PreviewModules = Record<string, () => Promise<Record<string, Type<unknown>>>>;

/**
 * Where an example finds its demo component.
 *
 * Provided by the browser entry point alone, which is the whole point: a preview imports the package
 * it demonstrates, so reaching one from the shared config would pull the library — echarts, konva,
 * the editor — into the worker that renders the documentation. Nothing renders a preview on the
 * server anyway; the token is simply absent there, and the frame says it is loading until hydration.
 */
export const PREVIEW_MODULES = new InjectionToken<PreviewModules>('xui docs preview modules');

export function providePreviews(modules: PreviewModules): Provider {
  return { provide: PREVIEW_MODULES, useValue: modules };
}
