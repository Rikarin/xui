import { XuiRadio } from './lib/radio';
import { XuiRadioGroup } from './lib/radio-group';

export * from './lib/radio';
export * from './lib/radio-group';
export * from './lib/radio.token';

export const XuiRadioImports = [XuiRadioGroup, XuiRadio] as const;
