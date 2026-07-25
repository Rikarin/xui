import { XuiNavigationMenu } from './lib/navigation-menu';
import { XuiNavigationMenuItem } from './lib/navigation-menu-item';

export * from './lib/navigation-menu';
export * from './lib/navigation-menu-item';

export const XuiNavigationMenuImports = [XuiNavigationMenu, XuiNavigationMenuItem] as const;
