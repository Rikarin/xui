import { ChangeDetectionStrategy, Component, input, linkedSignal, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { XuiAvatarImports } from '@xui/avatar';
import { XuiButtonImports } from '@xui/button';
import { XuiDescriptionsImports } from '@xui/descriptions';
import { XuiDrawerImports } from '@xui/drawer';
import { XuiFormFieldImports } from '@xui/form-field';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { XuiTextareaImports } from '@xui/textarea';
import { money, relativeTime } from '../../core/format';
import type { Customer, CustomerStatus } from '../../core/models';
import { customerInitials, statusColor } from './customer-format';

/**
 * The read-mostly side of the customers page: everything about one account, plus the internal note.
 *
 * The note draft is a `linkedSignal` over the customer and the open state, so reopening the drawer —
 * or switching to another customer while it is open — always starts from the saved note. Saving is
 * not this component's business: it emits the draft and the page owns the store update and the
 * toast, the same way it owns every other mutation.
 */
@Component({
  selector: 'app-customer-detail-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    XuiAvatarImports,
    XuiButtonImports,
    XuiDescriptionsImports,
    XuiDrawerImports,
    XuiFormFieldImports,
    XuiTagImports,
    XuiTextImports,
    XuiTextareaImports
  ],
  template: `
    <xui-drawer position="right" size="md" title="Customer" [open]="open()" (openChange)="open.set($event)">
      @if (customer(); as customer) {
        <div class="space-y-6 p-6">
          <div class="flex items-center gap-3">
            <xui-avatar [text]="initials(customer)" />
            <div class="min-w-0">
              <p class="truncate font-medium">{{ customer.name }}</p>
              <p xuiText size="sm" color="subtle" class="truncate">{{ customer.email }}</p>
            </div>
          </div>

          <xui-descriptions bordered [column]="1">
            <xui-descriptions-item label="Company">{{ customer.company }}</xui-descriptions-item>
            <xui-descriptions-item label="Country">{{ customer.country }}</xui-descriptions-item>
            <xui-descriptions-item label="Plan">{{ customer.plan }}</xui-descriptions-item>
            <xui-descriptions-item label="Status">
              <xui-tag minimal [color]="statusColor(customer.status)">{{ customer.status }}</xui-tag>
            </xui-descriptions-item>
            <xui-descriptions-item label="Orders">{{ customer.orders }}</xui-descriptions-item>
            <xui-descriptions-item label="Lifetime spend">{{ asMoney(customer.spend) }}</xui-descriptions-item>
            <xui-descriptions-item label="Joined">{{ ago(customer.joinedAt) }}</xui-descriptions-item>
            <xui-descriptions-item label="Last seen">{{ ago(customer.lastSeenAt) }}</xui-descriptions-item>
          </xui-descriptions>

          <xui-form-field label="Internal note" helperText="Saved against this customer only.">
            <textarea
              xuiTextarea
              autoResize
              class="w-full"
              rows="3"
              placeholder="Anything the next person should know…"
              [ngModel]="note()"
              (ngModelChange)="note.set($event)"
            ></textarea>
          </xui-form-field>

          <div class="flex justify-end gap-2">
            <button xuiButton variant="ghost" type="button" (click)="open.set(false)">Close</button>
            <button xuiButton type="button" (click)="saveNote.emit(note())">Save note</button>
          </div>
        </div>
      }
    </xui-drawer>
  `
})
export class CustomerDetailDrawer {
  /** The customer being shown; the drawer renders nothing while it is `null`. */
  readonly customer = input.required<Customer | null>();
  readonly open = model(false);
  /** Emits the note draft; the page saves it, shows the toast and closes the drawer. */
  readonly saveNote = output<string>();

  protected readonly note = linkedSignal(() => {
    this.open();

    return this.customer()?.notes ?? '';
  });

  protected statusColor(status: CustomerStatus): 'success' | 'warning' | 'error' {
    return statusColor(status);
  }

  protected initials(customer: Customer): string {
    return customerInitials(customer);
  }

  protected asMoney(value: number): string {
    return money(value);
  }

  protected ago(date: Date): string {
    return relativeTime(date);
  }
}
