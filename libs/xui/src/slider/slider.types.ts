export type SliderColor = 'primary' | 'primary-alt' | 'secondary' | 'error' | 'warning' | 'success';

export interface SliderMark {
  label: string;
  value: number;
  color?: SliderColor;
}
