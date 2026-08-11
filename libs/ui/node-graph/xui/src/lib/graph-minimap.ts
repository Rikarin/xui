import type { NumberInput } from '@angular/cdk/coercion';
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  numberAttribute,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiNodeGraphStore } from './node-graph-store';
import type { XuiGraphRect } from './node-graph.types';

/**
 * An overview of the whole graph with the current viewport drawn on it.
 *
 * ```html
 * <xui-node-graph>
 *   …
 *   <xui-graph-minimap class="right-4 bottom-4" />
 * </xui-node-graph>
 * ```
 *
 * Click or drag inside it to move the view. Like the controls, it is projected
 * into the overlay layer and so stays put while the canvas pans.
 */
@Component({
  selector: 'xui-graph-minimap',
  template: `
    <svg
      class="h-full w-full cursor-pointer"
      [attr.viewBox]="viewBox()"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Graph overview"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
    >
      @for (node of nodes(); track node.id) {
        <rect
          [attr.x]="node.x"
          [attr.y]="node.y"
          [attr.width]="node.width"
          [attr.height]="node.height"
          [attr.rx]="cornerRadius()"
          [attr.fill]="node.selected ? 'var(--color-primary)' : 'var(--color-border-strong)'"
        />
      }

      @if (viewportRect(); as rect) {
        <rect
          [attr.x]="rect.x"
          [attr.y]="rect.y"
          [attr.width]="rect.width"
          [attr.height]="rect.height"
          fill="var(--color-selection)"
          stroke="var(--color-primary)"
          [attr.stroke-width]="strokeWidth()"
        />
      }
    </svg>
  `,
  host: { '[class]': 'computedClass()', 'data-xui-graph-overlay': '' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiGraphMinimap {
  private readonly store = inject(XuiNodeGraphStore);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private dragging = false;

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** Blank margin around the content, in graph units. */
  readonly padding = input<number, NumberInput>(40, { transform: numberAttribute });

  protected readonly nodes = computed(() =>
    this.store.nodes().map(node => {
      const { x, y } = node.position();
      const { width, height } = node.size();

      return { id: node.nodeId(), x, y, width, height, selected: this.store.isNodeSelected(node.nodeId()) };
    })
  );

  /**
   * The extent the minimap shows: everything drawn, unioned with wherever the
   * viewport currently is, so panning off into empty space still tells you where
   * you are instead of silently clamping.
   */
  private readonly extent = computed<XuiGraphRect>(() => {
    const content = this.store.contentBounds();
    const view = this.viewportRect();
    const padding = this.padding();

    if (!content && !view) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }

    const boxes = [content, view].filter((box): box is XuiGraphRect => !!box);
    const minX = Math.min(...boxes.map(box => box.x)) - padding;
    const minY = Math.min(...boxes.map(box => box.y)) - padding;
    const maxX = Math.max(...boxes.map(box => box.x + box.width)) + padding;
    const maxY = Math.max(...boxes.map(box => box.y + box.height)) + padding;

    return { x: minX, y: minY, width: Math.max(maxX - minX, 1), height: Math.max(maxY - minY, 1) };
  });

  protected readonly viewportRect = computed<XuiGraphRect | null>(() => {
    const { x, y, zoom } = this.store.viewport();
    const { width, height } = this.store.surfaceSize();

    if (width === 0 || height === 0) {
      return null;
    }

    return { x: -x / zoom, y: -y / zoom, width: width / zoom, height: height / zoom };
  });

  protected readonly viewBox = computed(() => {
    const { x, y, width, height } = this.extent();

    return `${x} ${y} ${width} ${height}`;
  });

  /**
   * Keep hairlines and corners visually constant however far the extent zooms out.
   *
   * `null` on the server, which reports no `clientWidth` for anything. This is a
   * computed the template pulls on, not an effect, so an unguarded read is not
   * an error that gets logged and skipped — the NaN it produces serialises, and
   * every node in the response comes back carrying `rx="NaN"`. Withholding the
   * attribute leaves SVG's own default in place until the browser measures.
   */
  private readonly unitScale = computed<number | null>(() =>
    this.isBrowser ? this.extent().width / Math.max(this.element.clientWidth, 1) : null
  );

  protected readonly strokeWidth = computed(() => this.unitScale());
  protected readonly cornerRadius = computed(() => {
    const scale = this.unitScale();

    return scale === null ? null : scale * 2;
  });

  protected readonly computedClass = computed(() =>
    xui(
      // eslint-disable-next-line local/no-hand-z-index -- the minimap floats above the canvas inside the graph’s own stacking context
      'bg-surface-overlay/90 border-border shadow-elevation-2 pointer-events-auto absolute z-10 block h-32 w-48 ' +
        'overflow-hidden rounded-md border p-1 select-none',
      'right-4 bottom-4',
      this.class()
    )
  );

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    this.dragging = true;
    (event.target as Element).setPointerCapture(event.pointerId);
    this.centerOnPointer(event);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.dragging) {
      this.centerOnPointer(event);
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    this.dragging = false;
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  /**
   * Map the pointer through the SVG's `preserveAspectRatio` fit and centre the
   * canvas there. The fit letterboxes on one axis, so the scale has to be taken
   * from the tighter of the two — using the element's own aspect ratio would put
   * the target off by the size of the letterbox.
   */
  private centerOnPointer(event: PointerEvent): void {
    const rect = this.element.getBoundingClientRect();
    const extent = this.extent();

    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const scale = Math.min(rect.width / extent.width, rect.height / extent.height);
    const offsetX = (rect.width - extent.width * scale) / 2;
    const offsetY = (rect.height - extent.height * scale) / 2;
    const graphX = (event.clientX - rect.left - offsetX) / scale + extent.x;
    const graphY = (event.clientY - rect.top - offsetY) / scale + extent.y;
    const surface = this.store.surfaceSize();
    const { zoom } = this.store.viewport();

    this.store.panBy(
      surface.width / 2 - (graphX * zoom + this.store.viewport().x),
      surface.height / 2 - (graphY * zoom + this.store.viewport().y)
    );
  }
}
