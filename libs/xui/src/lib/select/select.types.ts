export type XuiSelectModeType = 'default' | 'multiple' | 'tags';

export interface XuiSelectOption {
  label: string | number | null;
  value: any;
  disabled?: boolean;
  hide?: boolean;
  groupLabel?: string | number;
}
