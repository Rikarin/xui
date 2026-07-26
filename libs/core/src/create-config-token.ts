import { InjectionToken, type ValueProvider, inject } from '@angular/core';

type InjectConfigFn<TConfig> = () => TConfig;

type ProvideConfigFn<TConfig> = (config: Partial<TConfig>) => ValueProvider;

export type CreateXConfigTokenReturn<TConfig> = [InjectConfigFn<TConfig>, ProvideConfigFn<TConfig>];

/**
 * Builds the config-token pair every styled package exposes: a `provideXui…Config`
 * that merges a partial over the defaults, and an `injectXui…Config` that falls
 * back to those defaults when nothing was provided.
 *
 * ```ts
 * export const [injectXuiButtonConfig, provideXuiButtonConfig] = createXConfigToken<XuiButtonConfig>(
 *   'XuiButtonConfig',
 *   { color: 'primary', variant: 'default', size: 'md' }
 * );
 * ```
 */
export function createXConfigToken<TConfig>(name: string, defaults: TConfig): CreateXConfigTokenReturn<TConfig> {
  const token = new InjectionToken<TConfig>(name);

  const injectFn = () => {
    return inject(token, { optional: true }) ?? defaults;
  };

  const provideFn = (config: Partial<TConfig>): ValueProvider => {
    return { provide: token, useValue: { ...defaults, ...config } };
  };

  return [injectFn, provideFn];
}
