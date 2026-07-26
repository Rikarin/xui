import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiStatusConfig } from './status.token';

const statusVariants = cva(['inline-flex aspect-square rounded-[50%]'], {
  variants: {
    presence: {
      online: 'bg-success',
      idle: 'bg-warning',
      dnd: 'bg-error',
      offline: 'bg-muted-foreground'
    },
    size: {
      sm: 'w-3',
      md: 'w-4',
      lg: 'w-6'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export type XuiStatusVariants = VariantProps<typeof statusVariants>;

const CLIP_PATHS: Partial<Record<NonNullable<XuiStatusVariants['presence']> & string, string>> = {
  idle: 'M0.564,0 A0.399,0.399,0,1,1,0,0.564 A0.502,0.502,0,1,0,0.564,0',
  dnd: 'M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 M0.78,0.603 H0.22 a0.103,0.103,0,0,1,0,-0.205 H0.78 a0.103,0.103,0,1,1,0,0.205',
  offline:
    'M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 m0,0.76 A0.26,0.26,0,1,1,0.76,0.5 A0.26,0.26,0,0,1,0.5,0.76'
};

@Component({
  selector: 'xui-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (clipPath(); as clip) {
      <svg width="0" height="0" aria-hidden="true">
        <clipPath [attr.id]="clip.id" clipPathUnits="objectBoundingBox">
          <path [attr.d]="clip.d" />
        </clipPath>
      </svg>
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '[style.clip-path]': 'computedStyle()'
  }
})
export class XuiStatus {
  private readonly config = injectXuiStatusConfig();

  /** The user-defined classes */
  readonly class = input<ClassValue>('');
  readonly presence = input<XuiStatusVariants['presence']>(this.config.presence);
  readonly size = input<XuiStatusVariants['size']>(this.config.size);

  /**
   * DOM ids must be unique, so each instance defines its own clip path rather
   * than sharing fixed ids across every status dot on the page.
   */
  private readonly instanceId = uniqueId('xui-status');

  /** The classes to apply to the component merged with the user-defined classes */
  protected readonly computedClass = computed(() =>
    xui(statusVariants({ presence: this.presence(), size: this.size() }), this.class())
  );

  protected readonly clipPath = computed(() => {
    const presence = this.presence();
    const d = presence ? CLIP_PATHS[presence] : undefined;
    return d ? { id: `${this.instanceId}-${presence}`, d } : null;
  });

  protected readonly computedStyle = computed(() => {
    const clip = this.clipPath();
    return clip ? `url(#${clip.id})` : null;
  });
}
