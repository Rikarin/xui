import { NumberInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  input,
  numberAttribute,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiAvatar, type XuiAvatarVariants } from './avatar';
import { injectXuiAvatarConfig } from './avatar.token';

/**
 * Overlaps a set of {@link XuiAvatar}s into a stack. With `max`, only the first
 * `max` avatars show and the rest collapse into a trailing `+N` avatar.
 *
 * ```html
 * <xui-avatar-group [max]="3">
 *   <xui-avatar text="A" />
 *   <xui-avatar text="B" />
 *   ...
 * </xui-avatar-group>
 * ```
 */
@Component({
  selector: 'xui-avatar-group',
  imports: [XuiAvatar],
  template: `
    <ng-content />
    @if (overflow() > 0) {
      <xui-avatar [text]="'+' + overflow()" [shape]="shape()" [size]="size()" />
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiAvatarGroup {
  private readonly config = injectXuiAvatarConfig();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Maximum avatars to show before collapsing the rest into `+N` (0 = no limit). */
  readonly max = input<number, NumberInput>(0, { transform: numberAttribute });
  /** Shape/size applied to the trailing `+N` avatar. */
  readonly shape = input<XuiAvatarVariants['shape']>(this.config.shape);
  /** Size of every avatar in the group, including the overflow counter. */
  readonly size = input<XuiAvatarVariants['size']>(this.config.size);

  private readonly projected = contentChildren(XuiAvatar, { read: ElementRef });

  /** How many projected avatars are hidden beyond `max`. */
  protected readonly overflow = computed(() => {
    const max = this.max();
    const count = this.projected().length;
    return max > 0 && count > max ? count - max : 0;
  });

  constructor() {
    // Hide the projected avatars past `max`.
    effect(() => {
      const max = this.max();
      this.projected().forEach((ref, index) => {
        (ref.nativeElement as HTMLElement).style.display = max > 0 && index >= max ? 'none' : '';
      });
    });
  }

  protected readonly computedClass = computed(() =>
    xui('inline-flex items-center [&>*]:ring-2 [&>*]:ring-surface [&>*:not(:first-child)]:-ms-2', this.class())
  );
}
