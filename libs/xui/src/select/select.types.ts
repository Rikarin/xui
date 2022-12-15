export type SelectSize = 'large' | 'small';
export type SelectColor = 'light' | 'dark';

export interface SelectItem {
  label: string;
  value: string | number | null;
}
