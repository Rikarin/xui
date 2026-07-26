import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject } from '@angular/core';
import { xui } from '@xui/core';
import { cva } from 'class-variance-authority';
import { XUI_TOOLTIP_CONTENT } from './tooltip-content';

const panelVariants = cva('pointer-events-none block max-w-xs rounded-md text-sm shadow-overlay', {
  variants: {
    intent: {
      // The neutral tooltip inverts against the page — a dark chip on light, a
      // light chip on dark — so it reads as an annotation rather than a surface.
      none: 'bg-foreground text-background',
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      error: 'bg-error text-error-foreground',
      warning: 'bg-warning text-warning-foreground',
      info: 'bg-info text-info-foreground'
    },
    compact: {
      true: 'px-2 py-1',
      false: 'px-3 py-1.5'
    }
  }
});

/**
 * The chip a tooltip's text sits on.
 *
 * `pointer-events-none` is load-bearing: a tooltip must never become a hover
 * target of its own, or moving the pointer onto it would keep it open forever
 * and it could sit over the thing it describes. It takes its config from
 * {@link XUI_TOOLTIP_CONTENT} because it is created dynamically.
 */
@Component({
  selector: 'xui-tooltip-panel',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isTemplate(content.content)) {
      <ng-container *ngTemplateOutlet="content.content; context: content.context ?? {}" />
    } @else {
      {{ content.content }}
    }
  `,
  host: {
    role: 'tooltip',
    '[id]': 'content.id',
    '[class]': 'computedClass()'
  }
})
export class XuiTooltipPanel {
  protected readonly content = inject(XUI_TOOLTIP_CONTENT);

  protected readonly computedClass = computed(() =>
    xui(panelVariants({ intent: this.content.intent, compact: this.content.compact }))
  );

  protected isTemplate(value: string | TemplateRef<unknown>): value is TemplateRef<unknown> {
    return value instanceof TemplateRef;
  }
}
