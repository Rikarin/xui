import { XuiDescriptions } from './lib/descriptions';
import { XuiDescriptionsItem } from './lib/descriptions-item';

export * from './lib/descriptions';
export * from './lib/descriptions-item';

export const XuiDescriptionsImports = [XuiDescriptions, XuiDescriptionsItem] as const;
