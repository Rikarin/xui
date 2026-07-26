import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { XuiAlertDialogImports } from '@xui/alert-dialog';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';
import { XuiCardImports } from '@xui/card';
import { XuiControlCardImports } from '@xui/control-card';
import { XuiFormFieldImports } from '@xui/form-field';
import { XuiInputImports } from '@xui/input';
import { XuiRadioImports } from '@xui/radio';
import { XuiSelectImports } from '@xui/select';
import { XuiSwitchImports } from '@xui/switch';
import { XuiTabsImports } from '@xui/tabs';
import { XuiTextImports } from '@xui/text';
import { XuiTextareaImports } from '@xui/textarea';
import { XuiToastService } from '@xui/toast';
import { Session } from '../core/session';
import { Theme, type ThemeMode } from '../core/theme';
import { Field } from '../shell/field';
import { PageHeader } from '../shell/page-header';

/**
 * Four tabs of forms, which is where an admin spends its least interesting and most repetitive
 * code.
 *
 * Two things are worth lifting from here. The appearance tab is bound straight to the {@link Theme}
 * service, so the radio group and the navbar's toggle are two views of one signal and can never
 * disagree. And the danger zone confirms through the same `xui-alert-dialog` the customers page
 * uses — one destructive-action pattern for the whole app, not one per screen.
 */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    XuiAlertDialogImports,
    XuiButtonImports,
    XuiCalloutImports,
    XuiCardImports,
    XuiControlCardImports,
    XuiFormFieldImports,
    XuiInputImports,
    XuiRadioImports,
    XuiSelectImports,
    XuiSwitchImports,
    XuiTabsImports,
    XuiTextImports,
    XuiTextareaImports,
    Field,
    PageHeader
  ],
  template: `
    <app-page-header title="Settings" description="Your profile, what we email you about, and how the app looks." />

    <div xuiCard [elevation]="1" class="max-w-3xl p-4 sm:p-6">
      <!--
        Four labels are wider than a phone. The arbitrary variant scrolls the strip only — wrapping
        the whole component would scroll its panels too.
      -->
      <xui-tabs class="[&_[role=tablist]]:overflow-x-auto" [(selectedTabId)]="tab">
        <xui-tab id="profile" title="Profile">
          <form class="max-w-md space-y-4" (ngSubmit)="save('Profile updated.')">
            <xui-form-field label="Full name">
              <input xuiInput class="w-full" [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" />
            </xui-form-field>

            <xui-form-field label="Email" helperText="Used for sign-in and for anything urgent.">
              <input
                xuiInput
                type="email"
                class="w-full"
                name="email"
                [ngModel]="email()"
                (ngModelChange)="email.set($event)"
              />
            </xui-form-field>

            <app-field label="Role" helperText="Only an owner can change billing.">
              <xui-select
                class="w-full"
                aria-label="Role"
                [items]="roles"
                [filterable]="false"
                [selectedItem]="role()"
                (selectionChange)="role.set($event)"
              />
            </app-field>

            <app-field label="Bio" labelFor="settings-bio" helperText="Optional.">
              <textarea
                xuiTextarea
                autoResize
                rows="3"
                class="w-full"
                id="settings-bio"
                name="bio"
                placeholder="What you look after here."
                [ngModel]="bio()"
                (ngModelChange)="bio.set($event)"
              ></textarea>
            </app-field>

            <button xuiButton type="submit">Save changes</button>
          </form>
        </xui-tab>

        <xui-tab id="notifications" title="Notifications">
          <div class="max-w-md space-y-3">
            @for (option of notifications(); track option.id) {
              <div class="border-border flex items-center justify-between gap-4 rounded-lg border p-3">
                <span class="min-w-0">
                  <span class="block text-sm font-medium" [id]="option.id + '-label'">{{ option.label }}</span>
                  <span xuiText size="xs" color="subtle" class="block">{{ option.hint }}</span>
                </span>
                <xui-switch
                  [checked]="option.enabled"
                  [aria-labelledby]="option.id + '-label'"
                  (checkedChange)="toggle(option.id, $event)"
                />
              </div>
            }

            <button xuiButton type="button" (click)="save('Notification preferences saved.')">Save preferences</button>
          </div>
        </xui-tab>

        <xui-tab id="appearance" title="Appearance">
          <div class="max-w-md space-y-4">
            <app-field label="Theme" helperText="Shared with the toggle in the header — both read one signal.">
              <xui-radio-group
                orientation="horizontal"
                name="theme"
                aria-label="Theme"
                [value]="theme.mode()"
                (valueChange)="onTheme($event)"
              >
                <xui-radio value="light">Light</xui-radio>
                <xui-radio value="dark">Dark</xui-radio>
              </xui-radio-group>
            </app-field>

            <xui-callout color="none">
              <p xuiText size="sm">
                Every colour in the app resolves through the token layer in
                <code xuiCode>&#64;xui/core/styles/theme.css</code>, which is why one class on
                <code xuiCode>&lt;html&gt;</code> re-themes the whole thing — no <code xuiCode>dark:</code> variant
                anywhere in this app.
              </p>
            </xui-callout>
          </div>
        </xui-tab>

        <xui-tab id="danger" title="Danger zone">
          <div class="max-w-md space-y-4">
            <xui-callout color="error" title="This cannot be undone">
              <p xuiText size="sm">
                Closing the workspace removes every customer, order and product in it. In this example it signs you out
                and resets the sample data.
              </p>
            </xui-callout>

            <button xuiButton color="error" type="button" (click)="confirmClose.set(true)">Close workspace</button>
          </div>
        </xui-tab>
      </xui-tabs>
    </div>

    <xui-alert-dialog
      destructive
      confirmLabel="Close it"
      title="Close this workspace?"
      description="Everything in it goes. In a real application this is the point where you would ask for the workspace name to be typed out."
      [(open)]="confirmClose"
      (confirmed)="closeWorkspace()"
    />
  `
})
export class Settings {
  protected readonly theme = inject(Theme);

  private readonly session = inject(Session);
  private readonly toaster = inject(XuiToastService);
  private readonly router = inject(Router);

  protected readonly tab = signal<string | null>('profile');
  protected readonly roles = ['Owner', 'Admin', 'Support', 'Read only'];

  protected readonly name = signal(this.session.user()?.name ?? '');
  protected readonly email = signal(this.session.user()?.email ?? '');
  protected readonly role = signal(this.session.user()?.role ?? 'Owner');
  protected readonly bio = signal('Looks after the Northwind storefront and its suppliers.');

  protected readonly notifications = signal([
    { id: 'orders', label: 'New orders', hint: 'A digest every hour, not one per order.', enabled: true },
    { id: 'refunds', label: 'Refunds over €200', hint: 'Immediately, by email.', enabled: true },
    { id: 'stock', label: 'Low stock', hint: 'When a line drops below 25 units.', enabled: true },
    {
      id: 'weekly',
      label: 'Weekly summary',
      hint: 'Monday morning, with the numbers from the dashboard.',
      enabled: false
    },
    { id: 'marketing', label: 'Product news', hint: 'What changed in the admin itself.', enabled: false }
  ]);

  protected readonly confirmClose = signal(false);

  protected toggle(id: string, enabled: boolean): void {
    this.notifications.update(options => options.map(option => (option.id === id ? { ...option, enabled } : option)));
  }

  protected onTheme(mode: ThemeMode | null): void {
    if (mode) {
      this.theme.mode.set(mode);
    }
  }

  protected save(message: string): void {
    this.toaster.show({ message, color: 'success' });
  }

  protected closeWorkspace(): void {
    this.session.signOut();
    this.toaster.show({ message: 'Workspace closed. The sample data is back to where it started.' });
    void this.router.navigateByUrl('/sign-in');
  }
}
