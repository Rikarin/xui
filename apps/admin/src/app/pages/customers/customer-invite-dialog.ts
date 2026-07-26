import { ChangeDetectionStrategy, Component, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { XuiButtonImports } from '@xui/button';
import { XuiDialogImports } from '@xui/dialog';
import { XuiFormFieldImports } from '@xui/form-field';
import { XuiInputImports } from '@xui/input';

/**
 * The invite form, owning nothing but its own draft.
 *
 * Cancelling keeps the typed email — closing a dialog by mistake should not cost the user their
 * input — while sending emits the address, closes and clears. Creating the invited account is the
 * page's job, next to the rest of the store mutations.
 */
@Component({
  selector: 'app-customer-invite-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, XuiButtonImports, XuiDialogImports, XuiFormFieldImports, XuiInputImports],
  template: `
    <xui-dialog [(open)]="open" title="Invite a customer" size="sm">
      <xui-dialog-body>
        <xui-form-field label="Email" helperText="They will get a link that expires in seven days.">
          <input
            xuiInput
            class="w-full"
            type="email"
            placeholder="name@company.example"
            [ngModel]="email()"
            (ngModelChange)="email.set($event)"
          />
        </xui-form-field>
      </xui-dialog-body>
      <xui-dialog-footer>
        <button xuiButton variant="ghost" type="button" (click)="open.set(false)">Cancel</button>
        <button xuiButton type="button" [disabled]="!email().includes('@')" (click)="send()">Send invitation</button>
      </xui-dialog-footer>
    </xui-dialog>
  `
})
export class CustomerInviteDialog {
  readonly open = model(false);
  /** Emits the trimmed email address once, when the invitation is sent. */
  readonly invite = output<string>();

  protected readonly email = signal('');

  protected send(): void {
    this.invite.emit(this.email().trim());
    this.open.set(false);
    this.email.set('');
  }
}
