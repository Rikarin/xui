export type SelectSize = 'large' | 'small';
export type SelectColor = 'light' | 'dark';
export type SelectValue = string | number | null;

export interface SelectItem {
  label: string;
  value: SelectValue;
}
