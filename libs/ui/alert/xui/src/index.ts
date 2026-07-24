import { XuiAlert } from './lib/alert';

export * from './lib/alert';
export * from './lib/alert-config';
// XuiConfirmDialog is intentionally not exported — it is an internal of the service.
export { XuiAlertService } from './lib/alert.service';

export const XuiAlertImports = [XuiAlert] as const;
