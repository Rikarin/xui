import { XuiMenu } from './lib/menu';
import { XuiMenuDivider } from './lib/menu-divider';
import { XuiMenuItem } from './lib/menu-item';
import { XuiMenuTrigger } from './lib/menu-trigger';

export * from './lib/menu';
export * from './lib/menu-divider';
export * from './lib/menu-item';
export * from './lib/menu-trigger';

export const XuiMenuImports = [XuiMenu, XuiMenuItem, XuiMenuDivider, XuiMenuTrigger] as const;
