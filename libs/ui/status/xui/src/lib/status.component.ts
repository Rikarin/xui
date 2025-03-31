import { Component, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const statusVariants = cva(['inline-flex aspect-square rounded-[50%]'], {
  variants: {
    variant: {
      online: 'bg-success',
      idle: 'bg-warning',
      dnd: 'bg-error',
      offline: 'bg-gray-600'
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

export type StatusVariants = VariantProps<typeof statusVariants>;

@Component({
  selector: 'xui-status',
  imports: [],
  template: `<svg>
      <clipPath id="x-status-idle-clip-path" clipPathUnits="objectBoundingBox">
        <path d="M0.564,0 A0.399,0.399,0,1,1,0,0.564 A0.502,0.502,0,1,0,0.564,0" />
      </clipPath>
    </svg>
    <svg>
      <clipPath id="x-status-dnd-clip-path" clipPathUnits="objectBoundingBox">
        <path
          d="M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 M0.78,0.603 H0.22 a0.103,0.103,0,0,1,0,-0.205 H0.78 a0.103,0.103,0,1,1,0,0.205"
        />
      </clipPath>
    </svg>
    <svg>
      <clipPath id="x-status-offline-clip-path" clipPathUnits="objectBoundingBox">
        <path
          d="M0.5,0 a0.5,0.5,0,1,0,0.5,0.5 A0.5,0.5,0,0,0,0.5,0 m0,0.76 A0.26,0.26,0,1,1,0.76,0.5 A0.26,0.26,0,0,1,0.5,0.76"
        />
      </clipPath>
    </svg>`,
  host: {
    '[class]': 'computedClass()',
    '[style.clip-path]': 'computedStyle()'
  }
})
export class XuiStatusComponent {
  /** The user defined classes */
  readonly class = input<ClassValue>('');
  readonly variant = input.required<StatusVariants['variant']>();
  readonly size = input<StatusVariants['size']>('md');

  /** The classes to apply to the component merged with the user defined classes */
  protected readonly computedClass = computed(() =>
    xui(statusVariants({ variant: this.variant(), size: this.size() }), this.class())
  );

  protected readonly computedStyle = computed(() => {
    switch (this.variant()) {
      case 'idle':
        return 'url(#x-status-idle-clip-path)';
      case 'dnd':
        return 'url(#x-status-dnd-clip-path)';
      case 'offline':
        return 'url(#x-status-offline-clip-path)';
    }

    return null;
  });
}
