import type { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matCheckCircleRound,
  matErrorRound,
  matInfoRound,
  matLightbulbRound,
  matWarningRound
} from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const calloutVariants = cva('flex gap-3 rounded-lg border', {
  variants: {
    color: {
      none: 'bg-muted border-border',
      primary: 'bg-primary-subtle border-primary-muted',
      secondary: 'bg-secondary-subtle border-secondary-muted',
      success: 'bg-success-subtle border-success-muted',
      error: 'bg-error-subtle border-error-muted',
      warning: 'bg-warning-subtle border-warning-muted',
      info: 'bg-info-subtle border-info-muted'
    },
    /** Drop the tinted fill, keeping only the border. */
    minimal: { true: 'bg-transparent!', false: '' },
    compact: { true: 'p-2 text-sm', false: 'p-4' }
  },
  defaultVariants: {
    color: 'none',
    minimal: false,
    compact: false
  }
});

const calloutIconVariants = cva('mt-0.5 shrink-0', {
  variants: {
    color: {
      none: 'text-foreground-muted',
      primary: 'text-primary-emphasis',
      secondary: 'text-secondary-emphasis',
      success: 'text-success-emphasis',
      error: 'text-error-emphasis',
      warning: 'text-warning-emphasis',
      info: 'text-info-emphasis'
    }
  },
  defaultVariants: { color: 'none' }
});

export type CalloutVariants = VariantProps<typeof calloutVariants>;
export type CalloutColor = NonNullable<CalloutVariants['color']>;

/** The glyph each intent implies when no icon is given. */
const DEFAULT_ICONS: Record<CalloutColor, string | null> = {
  none: null,
  primary: 'matInfoRound',
  secondary: 'matInfoRound',
  success: 'matCheckCircleRound',
  error: 'matErrorRound',
  warning: 'matWarningRound',
  info: 'matLightbulbRound'
};

/**
 * A boxed note that draws attention to a piece of text.
 *
 * ```html
 * <xui-callout color="warning" title="Heads up">
 *   Saving will overwrite the existing draft.
 * </xui-callout>
 * ```
 *
 * A colour implies an icon, so the common case needs no `icon` at all. Pass
 * `icon="none"` to suppress it, or any `@ng-icons` name to override it.
 */
@Component({
  selector: 'xui-callout',
  imports: [NgIcon, XuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ matCheckCircleRound, matErrorRound, matInfoRound, matLightbulbRound, matWarningRound })
  ],
  template: `
    @if (resolvedIcon(); as iconName) {
      <ng-icon xui size="sm" [name]="iconName" [class]="computedIconClass()" />
    }

    <div class="min-w-0 flex-1">
      @if (title()) {
        <p class="text-foreground mb-1 font-semibold">{{ title() }}</p>
      }
      <div class="text-foreground-muted"><ng-content /></div>
    </div>
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.role]': 'role()'
  }
})
export class XuiCallout {
  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly color = input<CalloutColor>('none');

  /** Optional heading rendered above the content. */
  readonly title = input<string | null>(null);

  /**
   * An `@ng-icons` name, or `'none'` to suppress the icon the colour would
   * otherwise imply.
   */
  readonly icon = input<string | 'none' | null>(null);

  readonly minimal = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly compact = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * An error or warning callout is announced as an alert so a screen reader
   * reaches it without the user hunting for it; the rest are ordinary content.
   */
  protected readonly role = computed(() => (this.color() === 'error' || this.color() === 'warning' ? 'alert' : null));

  protected readonly resolvedIcon = computed(() => {
    const icon = this.icon();

    if (icon === 'none') {
      return null;
    }

    return icon ?? DEFAULT_ICONS[this.color()];
  });

  protected readonly computedClass = computed(() =>
    xui(calloutVariants({ color: this.color(), minimal: this.minimal(), compact: this.compact() }), this.class())
  );

  protected readonly computedIconClass = computed(() => calloutIconVariants({ color: this.color() }));
}
