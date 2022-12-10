export interface PanelBarItem {
  title: string;
  content?: any;
  // disabled?: boolean;
  // expanded: boolean;
  // focused: boolean;
  // hidden?: boolean;

  icon?: string;
  iconClass?: string;

  // id: string; // probably ARIA?
  // selected: boolean;

  children?: PanelBarItem[];
}
