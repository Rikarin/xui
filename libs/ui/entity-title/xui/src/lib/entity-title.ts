import type { BooleanInput } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { XuiSkeletonMask } from '@xui/skeleton';
import { XuiTextImports } from '@xui/text';
import type { ClassValue } from 'clsx';

/**
 * The name of a thing, with its supporting detail.
 *
 * ```html
 * <xui-entity-title title="Quarterly report" subtitle="Updated 2 hours ago">
 *   <ng-icon xui visual name="matDescriptionRound" />
 *   <span tags><span xuiBadge>Draft</span></span>
 * </xui-entity-title>
 * ```
 *
 * Used as the heading of a section, a card or a list row. `loading` masks the
 * text in place through `xuiSkeleton`, so the row keeps its height and nothing
 * jumps when the real values arrive.
 */
@Component({
  selector: 'xui-entity-title',
  imports: [XuiTextImports, XuiSkeletonMask],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-foreground-muted shrink-0 empty:hidden">
      <ng-content select="[visual]" />
    </div>

    <div class="flex min-w-0 flex-col gap-0.5">
      <div class="flex min-w-0 items-center gap-2">
        <span xuiText weight="medium" [ellipsize]="ellipsize()" [xuiSkeleton]="loading()">{{ title() }}</span>
        <span class="flex shrink-0 gap-1 empty:hidden">
          <ng-content select="[tags]" />
        </span>
      </div>

      @if (subtitle()) {
        <span xuiText color="muted" size="sm" [ellipsize]="ellipsize()" [xuiSkeleton]="loading()">
          {{ subtitle() }}
        </span>
      }

      <ng-content />
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiEntityTitle {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);

  /** Truncate the title and subtitle rather than wrapping. */
  readonly ellipsize = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Expand to fill the container, so a right-aligned sibling is pushed out. */
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Mask the text in place while the entity is loading. */
  readonly loading = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui('flex items-center gap-3', this.fill() && 'w-full', this.class())
  );
}
