import { XuiPopover } from './lib/popover';
import { XuiPopoverPanel } from './lib/popover-panel';

export * from './lib/popover';
export * from './lib/popover-content';
export * from './lib/popover-panel';
export * from './lib/popover.token';

export const XuiPopoverImports = [XuiPopover, XuiPopoverPanel] as const;
