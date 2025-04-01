import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  effect,
  input,
  signal,
  untracked
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'xui-table',
  host: {
    '[class]': 'computedClass()',
    role: 'table',
    '[attr.aria-labelledby]': 'labeledBy()'
  },
  template: ` <ng-content /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTableComponent {
  public readonly class = input<ClassValue>('');
  protected readonly computedClass = computed(() =>
    xui('flex flex-col text-sm [&_xui-tr:last-child]:border-0', this.class())
  );

  // eslint-disable-next-line
  public readonly labeledByInput = input<string | null | undefined>(undefined, { alias: 'aria-labelledby' });
  public readonly labeledBy = signal<string | null | undefined>(undefined);

  constructor() {
    effect(() => {
      const labeledBy = this.labeledByInput();

      untracked(() => {
        this.labeledBy.set(labeledBy);
      });
    });
  }
}
