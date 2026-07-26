import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * The scrollable body of a dialog.
 *
 * It owns the vertical scroll, so a tall dialog keeps its header and footer
 * pinned while only the middle scrolls — the header/footer never scroll out of
 * reach on a short viewport.
 */
@Component({
  selector: 'xui-dialog-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiDialogBody {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('text-foreground block min-h-0 flex-1 overflow-y-auto px-6 py-4 text-sm', this.class())
  );
}

/**
 * The footer bar of a dialog, where the actions live.
 *
 * Actions sit at the end by default; `align="between"` splits them, for a
 * destructive action kept away from the confirm.
 */
@Component({
  selector: 'xui-dialog-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiDialogFooter {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  /** How the footer's buttons are distributed: packed at the end (the default), at the start, or pushed apart. */
  readonly align = input<'end' | 'between' | 'start'>('end');

  protected readonly computedClass = computed(() =>
    xui(
      'border-border flex shrink-0 items-center gap-2 border-t px-6 py-4',
      this.align() === 'between' ? 'justify-between' : this.align() === 'start' ? 'justify-start' : 'justify-end',
      this.class()
    )
  );
}
