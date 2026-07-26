import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, signal } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import { ClassValue } from 'clsx';

/** How each button's contents align — applied to every child. */
export type XuiButtonGroupAlign = 'left' | 'center' | 'right';

const alignClass: Record<XuiButtonGroupAlign, string> = {
  left: '[&>*]:justify-start [&>*]:text-start',
  center: '',
  right: '[&>*]:justify-end [&>*]:text-end'
};

const buttonGroupVariants = cva('inline-flex', {
  variants: {
    orientation: {
      // Collapse the radii and drop the doubled border between neighbours, on
      // whichever axis the group runs.
      horizontal: 'flex-row *:not-first:rounded-s-none *:not-last:rounded-e-none *:not-first:border-s-0',
      vertical: 'flex-col *:not-first:rounded-t-none *:not-last:rounded-b-none *:not-first:border-t-0'
    },
    fill: {
      true: '[&>*]:min-w-0 [&>*]:flex-1',
      false: ''
    }
  },
  defaultVariants: { orientation: 'horizontal', fill: false }
});

export type XuiButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;

@Directive({
  selector: '[xuiButtonGroup]',
  exportAs: 'xuiButtonGroup',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiButtonGroup {
  private readonly additionalClasses = signal<ClassValue>('');

  readonly class = input<ClassValue>('');

  /** Run the buttons in a row (default) or stack them vertically. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  /** Stretch the buttons to share the group's width (or height) equally. */
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Align every button's contents. Defaults to centred. */
  readonly alignText = input<XuiButtonGroupAlign>('center');

  protected readonly computedClass = computed(() =>
    xui(
      buttonGroupVariants({ orientation: this.orientation(), fill: this.fill() }),
      alignClass[this.alignText() ?? 'center'],
      this.fill() && 'flex w-full',
      this.class(),
      this.additionalClasses()
    )
  );

  setClass(classes: ClassValue): void {
    this.additionalClasses.set(classes);
  }
}
