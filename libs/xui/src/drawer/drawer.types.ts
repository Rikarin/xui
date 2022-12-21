export type DrawerMode = 'overlay' | 'push';

export interface DrawerItem {
  label: string;
  icon?: string;

  expanded?: boolean;

  children?: DrawerItem[];
}
