import { Component, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiAlert, XuiAlertImports, XuiAlertService } from '@xui/alert';
import { XuiButtonImports } from '@xui/button';

/**
 * A small confirm/cancel modal for irreversible actions. A preset over
 * `@xui/dialog`; dismissing it any way counts as a cancel. The overlay behaviour
 * is not testable in jsdom, so these stories verify it.
 */
const meta: Meta<XuiAlert> = {
  title: 'Overlays/Alert',
  component: XuiAlert,
  decorators: [moduleMetadata({ imports: [XuiAlertImports, XuiButtonImports] })]
};

export default meta;
type Story = StoryObj<XuiAlert>;

/** A destructive confirm — red icon and red confirm button. */
export const Default: Story = {
  render: () => ({
    props: { open: signal(false), result: signal('') },
    template: `
      <button xuiButton color="error" (click)="open.set(true)">Delete project</button>
      @if (result()) { <p class="text-foreground-muted mt-3 text-sm">You chose: {{ result() }}</p> }
      <xui-alert
        [(isOpen)]="open"
        intent="error"
        confirmText="Delete"
        cancelText="Cancel"
        (confirmed)="result.set('confirmed')"
        (canceled)="result.set('canceled')"
      >
        Delete <b>warehouse-sync</b>? This permanently removes the project and cannot be undone.
      </xui-alert>
    `
  })
};

/** Acknowledge-only: no cancel button, just an OK. */
export const Acknowledge: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button xuiButton (click)="open.set(true)">Show notice</button>
      <xui-alert [(isOpen)]="open" intent="success" confirmText="Got it">
        Your changes have been published.
      </xui-alert>
    `
  })
};

@Component({
  selector: 'xui-alert-service-demo',
  imports: [XuiButtonImports],
  template: `
    <button xuiButton color="error" (click)="ask()">Delete (imperative)</button>
    @if (answer() !== null) {
      <p class="text-foreground-muted mt-3 text-sm">Promise resolved: {{ answer() }}</p>
    }
  `
})
class AlertServiceDemo {
  private readonly alerts = inject(XuiAlertService);
  readonly answer = signal<boolean | null>(null);

  async ask(): Promise<void> {
    const ok = await this.alerts.confirm({
      message: 'Delete this record? This cannot be undone.',
      intent: 'error',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    this.answer.set(ok);
  }
}

/** `XuiAlertService.confirm()` resolves a promise you can await. */
export const Imperative: Story = {
  render: () => ({
    moduleMetadata: { imports: [AlertServiceDemo] },
    template: `<xui-alert-service-demo />`
  })
};
