import { XuiOmnibar } from './lib/omnibar';
import { XuiOmnibarEmpty } from './lib/omnibar-empty';

export * from './lib/omnibar';
export * from './lib/omnibar-empty';
export * from './lib/omnibar.types';

export const XuiOmnibarImports = [XuiOmnibar, XuiOmnibarEmpty] as const;
