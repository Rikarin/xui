export interface SettingsPage {
  // canExit: boolean;
  stateChanged: (state: boolean) => void;

  save(): Promise<boolean>;
  reset(): Promise<boolean>;
}

export interface MenuItem {
  type: 'category' | 'item' | 'divider';
  name?: string;
  critical?: boolean;
  component?: any;
  action?: () => void;
}
