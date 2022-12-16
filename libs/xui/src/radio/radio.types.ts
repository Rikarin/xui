export type RadioValue = string | number | null;
export type RadioColor = 'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'none';

export interface RadioItem {
  label: string;
  value: RadioValue;
}
