import { Component, inject } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiToastService } from '@xui/toast';

/**
 * Transient notices that stack in a corner and dismiss themselves. Raised from
 * `XuiToastService`, mounted on a corner-pinned overlay (no backdrop — the page
 * stays usable). Stacking, timers and placement are not testable in jsdom, so
 * these stories are the real check.
 */
@Component({
  selector: 'xui-toast-demo',
  imports: [XuiButtonImports],
  template: `
    <div class="flex flex-wrap gap-2">
      <button xuiButton (click)="toaster.show({ message: 'Changes saved.', color: 'success' })">Success</button>
      <button
        xuiButton
        variant="outline"
        (click)="toaster.show({ message: 'Heads up — check your input.', color: 'warning' })"
      >
        Warning
      </button>
      <button
        xuiButton
        color="error"
        (click)="
          toaster.show({ message: 'Upload failed.', color: 'error', actionText: 'Retry', onAction: retry, timeout: 0 })
        "
      >
        Error + action
      </button>
      <button xuiButton variant="ghost" (click)="toaster.show({ message: 'Just so you know.', color: 'primary' })">
        Info
      </button>
      <button xuiButton variant="ghost" (click)="toaster.clear()">Clear all</button>
    </div>
  `
})
class ToastDemo {
  protected readonly toaster = inject(XuiToastService);
  protected readonly retry = () => this.toaster.show({ message: 'Retrying…', color: 'primary' });
}

const meta: Meta<ToastDemo> = {
  title: 'Overlays/Toast',
  component: ToastDemo,
  decorators: [moduleMetadata({ imports: [ToastDemo] })]
};

export default meta;
type Story = StoryObj<ToastDemo>;

/** Raise one of each color; the error one carries a Retry action and never auto-dismisses. */
export const Default: Story = { render: () => ({ template: `<xui-toast-demo />` }) };
