import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { XuiButtonImports } from '@xui/button';
import { XuiToastService } from '@xui/toast';

/**
 * A toast is raised from a service, so the demo needs a class to hold the handler - the generator
 * would have to stub the very call the example is about.
 *
 * Mirrors `apps/ui-storybook/stories/toast.stories.ts`; keep the two in step.
 */
@Component({
  selector: 'docs-toast-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class PreviewDefault {
  protected readonly toaster = inject(XuiToastService);
  protected readonly retry = () => this.toaster.show({ message: 'Retrying…', color: 'primary' });
}
