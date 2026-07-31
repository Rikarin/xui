import { XuiProse } from './lib/prose';
import { XuiProseAnchor } from './lib/prose-anchor';

export * from './lib/prose';
export * from './lib/prose-anchor';
export * from './lib/prose.token';

export const XuiProseImports = [XuiProse, XuiProseAnchor] as const;
