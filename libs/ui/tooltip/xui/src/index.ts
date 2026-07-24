import { XuiTooltip } from './lib/tooltip';
import { XuiTooltipPanel } from './lib/tooltip-panel';

export * from './lib/tooltip';
export * from './lib/tooltip-content';
export * from './lib/tooltip-panel';
export * from './lib/tooltip.token';

export const XuiTooltipImports = [XuiTooltip, XuiTooltipPanel] as const;
