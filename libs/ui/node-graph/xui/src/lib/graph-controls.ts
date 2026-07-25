import type { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiNodeGraphStore } from './node-graph-store';
import { injectXuiNodeGraphConfig } from './node-graph.token';

/**
 * Zoom and framing buttons for the enclosing canvas.
 *
 * ```html
 * <xui-node-graph>
 *   …
 *   <xui-graph-controls class="bottom-4 left-4" />
 * </xui-node-graph>
 * ```
 *
 * Placed anywhere inside `<xui-node-graph>`; it is projected into the overlay
 * layer, above the canvas and outside its transform, so it neither pans nor
 * scales with the content.
 */
@Component({
  selector: 'xui-graph-controls',
  template: `
    <button type="button" [class]="buttonClass" aria-label="Zoom in" (click)="store.zoomBy(step)">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 2 V12 M2 7 H12" [attr.stroke]="'currentColor'" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <button type="button" [class]="buttonClass" aria-label="Zoom out" (click)="store.zoomBy(1 / step)">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M2 7 H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    @if (showFit()) {
      <button type="button" [class]="buttonClass" aria-label="Fit view" (click)="store.fitView()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2 5 V2 H5 M9 2 H12 V5 M12 9 V12 H9 M5 12 H2 V9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    }

    @if (showZoomLevel()) {
      <span class="text-foreground-subtle px-1 text-center text-[10px] tabular-nums">{{ zoomPercent() }}%</span>
    }

    <ng-content />
  `,
  host: { '[class]': 'computedClass()', 'data-xui-graph-overlay': '' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphControls {
  private readonly config = injectXuiNodeGraphConfig();

  protected readonly store = inject(XuiNodeGraphStore);
  protected readonly step = this.config.zoomStep;

  protected readonly buttonClass =
    'text-foreground-muted hover:bg-hover-overlay hover:text-foreground focus-visible:ring-focus flex h-7 w-7 ' +
    'cursor-pointer items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none';

  readonly class = input<ClassValue>('');

  readonly showFit = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly showZoomLevel = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Lay the buttons out in a row rather than a column. */
  readonly horizontal = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly zoomPercent = computed(() => Math.round(this.store.viewport().zoom * 100));

  protected readonly computedClass = computed(() =>
    xui(
      'bg-surface-overlay border-border shadow-elevation-2 pointer-events-auto absolute z-10 flex gap-0.5 rounded-md border p-1 select-none',
      this.horizontal() ? 'flex-row items-center' : 'flex-col',
      // A sensible default corner; override with `class` to move it.
      'bottom-4 left-4',
      this.class()
    )
  );
}
