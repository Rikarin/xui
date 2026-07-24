import { XuiDialog } from './lib/dialog';
import { XuiDialogBody, XuiDialogFooter } from './lib/dialog-parts';

export * from './lib/dialog';
export * from './lib/dialog-parts';
export * from './lib/dialog.service';
export * from './lib/dialog.token';

export const XuiDialogImports = [XuiDialog, XuiDialogBody, XuiDialogFooter] as const;
