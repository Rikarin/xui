import { NgIcon } from '@ng-icons/core';
import { XuiIcon } from './lib/icon';

export * from './lib/icon';
export * from './lib/icon.token';

/**
 * Everything `<ng-icon xui …>` needs. `XuiIcon` is only the `xui` attribute — the
 * element itself is `NgIcon` from `@ng-icons/core`, so the barrel carries both
 * and a component imports nothing else to render an icon.
 */
export const XuiIconImports = [NgIcon, XuiIcon] as const;
