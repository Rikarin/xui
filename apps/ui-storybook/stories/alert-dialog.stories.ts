import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiAlertDialog, XuiAlertDialogImports } from '@xui/alert-dialog';
import { XuiButtonImports } from '@xui/button';

/**
 * A modal confirmation for a consequential choice. It takes focus, blocks the
 * page and asks for an explicit Confirm / Cancel. `open` is two-way bindable;
 * `confirmed` / `cancelled` report the outcome.
 */
const meta: Meta<XuiAlertDialog> = {
  title: 'Overlays/Alert dialog',
  component: XuiAlertDialog,
  decorators: [moduleMetadata({ imports: [XuiAlertDialogImports, XuiButtonImports] })]
};

export default meta;
type Story = StoryObj<XuiAlertDialog>;

export const Destructive: Story = {
  render: () => ({
    props: { open: signal(false), last: signal('—') },
    template: `
      <div class="flex flex-col items-start gap-3">
        <button xuiButton color="error" (click)="open.set(true)">Delete project</button>
        <span class="text-foreground-muted text-sm">Last action: {{ last() }}</span>
      </div>
      <xui-alert-dialog
        [(open)]="open"
        destructive
        title="Delete project?"
        description="This permanently removes the project and all its data. This action cannot be undone."
        confirmText="Delete"
        (confirmed)="last.set('confirmed')"
        (cancelled)="last.set('cancelled')"
      />
    `
  })
};

export const Confirm: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button xuiButton (click)="open.set(true)">Publish</button>
      <xui-alert-dialog
        [(open)]="open"
        title="Publish this release?"
        description="Subscribers will be notified immediately."
        confirmText="Publish"
      />
    `
  })
};

/** Not dismissible — the user must pick an explicit option. */
export const Blocking: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button xuiButton (click)="open.set(true)">Review terms</button>
      <xui-alert-dialog
        [(open)]="open"
        [dismissible]="false"
        title="Accept updated terms"
        description="You need to accept the new terms before continuing."
        confirmText="Accept"
        cancelText="Not now"
      />
    `
  })
};
