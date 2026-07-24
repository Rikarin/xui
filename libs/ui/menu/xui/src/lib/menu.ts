import { CdkMenu } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A list of commands, opened from a trigger.
 *
 * ```html
 * <button xuiButton [xuiMenuTriggerFor]="actions">Actions</button>
 * <ng-template #actions>
 *   <xui-menu>
 *     <button xuiMenuItem (triggered)="rename()">Rename</button>
 *     <xui-menu-divider />
 *     <button xuiMenuItem intent="error" (triggered)="delete()">Delete</button>
 *   </xui-menu>
 * </ng-template>
 * ```
 *
 * Built on `@angular/cdk/menu`, which owns the hard parts — roving focus,
 * typeahead, submenu aim, Escape and close-on-select — so every menu, context
 * menu and select dropdown gets the same keyboard model for free. This component
 * only dresses the panel; `CdkMenu` on its host provides `role="menu"` and the
 * behaviour.
 */
@Component({
  selector: 'xui-menu',
  hostDirectives: [{ directive: CdkMenu, outputs: ['closed'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiMenu {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui(
      'bg-surface-overlay border-border shadow-overlay flex min-w-[10rem] flex-col gap-0.5 rounded-lg border p-1 outline-none',
      this.class()
    )
  );
}
