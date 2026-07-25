import { XuiSelect } from './lib/select';
import { XuiSelectOption } from './lib/select-option';

export * from './lib/select';
export * from './lib/select-option';

export const XuiSelectImports = [XuiSelect, XuiSelectOption] as const;
