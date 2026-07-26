import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiNonIdealStateConfig } from './non-ideal-state.token';

export const nonIdealStateVariants = cva('flex text-center', {
  variants: {
    orientation: {
      vertical: 'flex-col items-center justify-center gap-3 p-8',
      horizontal: 'flex-row items-center gap-4 p-6 text-start'
    }
  },
  defaultVariants: {
    orientation: 'vertical'
  }
});

export type XuiNonIdealStateVariants = VariantProps<typeof nonIdealStateVariants>;

/**
 * The placeholder shown when there is nothing to show: an empty list, a failed
 * search, an error.
 *
 * ```html
 * <xui-non-ideal-state title="No results" description="Try a different search.">
 *   <ng-icon xui visual size="xl" name="matSearchRound" />
 *   <button xuiButton action>Clear filters</button>
 * </xui-non-ideal-state>
 * ```
 *
 * The visual and the action are content-projected rather than inputs, so they
 * can be any component — an icon, a spinner, an illustration — without this
 * package having to know about them.
 */
@Component({
  selector: 'xui-non-ideal-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="computedVisualClass()">
      <ng-content select="[visual]" />
    </div>

    <div [class]="computedBodyClass()">
      @if (title()) {
        <p class="text-foreground font-semibold">{{ title() }}</p>
      }
      @if (description()) {
        <p class="text-foreground-muted text-sm">{{ description() }}</p>
      }
      <ng-content />
      <div [class]="computedActionClass()">
        <ng-content select="[action]" />
      </div>
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiNonIdealState {
  private readonly config = injectXuiNonIdealStateConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly orientation = input<XuiNonIdealStateVariants['orientation']>(this.config.orientation);

  readonly title = input<string | null>(null);
  readonly description = input<string | null>(null);

  protected readonly computedClass = computed(() =>
    xui(nonIdealStateVariants({ orientation: this.orientation() }), this.class())
  );

  // The projected visual is muted so it frames the message rather than
  // competing with it.
  protected readonly computedVisualClass = computed(() =>
    xui('text-foreground-subtle empty:hidden', this.orientation() === 'horizontal' && 'shrink-0')
  );

  protected readonly computedBodyClass = computed(() =>
    xui('flex flex-col gap-1', this.orientation() === 'vertical' && 'items-center')
  );

  protected readonly computedActionClass = computed(() =>
    xui('mt-3 flex gap-2 empty:mt-0 empty:hidden', this.orientation() === 'vertical' && 'justify-center')
  );
}
