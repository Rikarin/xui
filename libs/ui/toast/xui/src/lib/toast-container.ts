import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { XuiToast } from './toast';
import { XuiToastService } from './toast.service';

/**
 * The stack the toaster renders its live notices into.
 *
 * Mounted once on a corner-pinned overlay by `XuiToastService`; it reads the
 * service's toast signal and lays the notices out. Bottom positions stack in
 * reverse so a new toast appears nearest its edge and pushes the older ones
 * away from it — the direction people expect a stack to grow.
 *
 * The stack itself ignores the pointer (so it never blocks the page beneath);
 * each toast re-enables pointer events for its own buttons.
 */
@Component({
  selector: 'xui-toast-container',
  imports: [XuiToast],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toast of service.toasts(); track toast.id) {
      <xui-toast
        [toast]="toast"
        (actionClicked)="service.runAction(toast.id)"
        (dismissed)="service.dismiss(toast.id)"
      />
    }
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiToastContainer {
  protected readonly service = inject(XuiToastService);

  protected readonly computedClass = computed(() => {
    const fromBottom = this.service.position().startsWith('bottom');

    return `pointer-events-none flex flex-col gap-2 ${fromBottom ? 'flex-col-reverse' : ''}`;
  });
}
