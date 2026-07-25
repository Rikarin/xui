import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const avatarVariants = cva(
  'bg-surface-inset text-foreground-muted inline-flex shrink-0 items-center justify-center overflow-hidden border-border align-middle font-medium select-none',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md'
      },
      size: {
        sm: 'h-6 w-6 text-xs',
        md: 'h-8 w-8 text-sm',
        lg: 'h-10 w-10 text-base',
        xl: 'h-14 w-14 text-lg'
      }
    },
    defaultVariants: {
      shape: 'circle',
      size: 'md'
    }
  }
);
export type AvatarVariants = VariantProps<typeof avatarVariants>;

/**
 * A compact user/entity representation: an image, text initials, or projected
 * icon. Falls back to the text/icon when the image fails to load.
 *
 * ```html
 * <xui-avatar src="/me.png" alt="Me" />
 * <xui-avatar text="JD" />
 * <xui-avatar><xui-icon name="user" /></xui-avatar>
 * ```
 */
@Component({
  selector: 'xui-avatar',
  template: `
    @if (src() && !imageFailed()) {
      <img [src]="src()" [alt]="alt()" class="h-full w-full object-cover" (error)="imageFailed.set(true)" />
    } @else if (text()) {
      <span class="leading-none">{{ text() }}</span>
    } @else {
      <ng-content />
    }
  `,
  host: {
    '[class]': 'computedClass()',
    role: 'img',
    '[attr.aria-label]': 'alt() || text() || null'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiAvatar {
  readonly class = input<ClassValue>('');

  /** Image URL. Falls back to `text`/projected content on load error. */
  readonly src = input<string>();
  readonly alt = input<string>('');
  /** Initials or short text shown when there is no image. */
  readonly text = input<string>();
  readonly shape = input<AvatarVariants['shape']>('circle');
  readonly size = input<AvatarVariants['size']>('md');

  /** Whether the image failed to load; resets when `src` changes. */
  readonly imageFailed = linkedSignal<string | undefined, boolean>({
    source: this.src,
    computation: () => false
  });

  protected readonly computedClass = computed(() =>
    xui(avatarVariants({ shape: this.shape(), size: this.size() }), this.class())
  );
}
