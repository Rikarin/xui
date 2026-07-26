import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { XuiAlertDialogImports } from '@xui/alert-dialog';
import type { Customer } from '../../core/models';

/**
 * The delete confirmation, kept destructive-but-honest: the copy promises the undo the page's
 * toast actually offers. Confirming only emits — the removal, the drawer close and the undoable
 * toast stay on the page, where the store and the toaster already live.
 */
@Component({
  selector: 'app-customer-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiAlertDialogImports],
  template: `
    <xui-alert-dialog
      destructive
      confirmText="Delete"
      [(open)]="open"
      [title]="'Delete ' + (customer()?.name ?? 'this customer') + '?'"
      description="Their orders stay, but the account and its contact details are removed. You can undo this immediately afterwards."
      (confirmed)="confirmed.emit()"
    />
  `
})
export class CustomerDeleteDialog {
  /** The customer the confirmation is about; only the name is read, for the title. */
  readonly customer = input.required<Customer | null>();
  readonly open = model(false);
  readonly confirmed = output<void>();
}
