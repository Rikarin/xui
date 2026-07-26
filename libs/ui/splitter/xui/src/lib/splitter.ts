import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { arrowDirectionOnAxis, injectXDirection } from '@xui/core/a11y';
import type { ClassValue } from 'clsx';
import { XuiSplitterPanel } from './splitter-panel';

/**
 * Resizable split panes. Wrap `<xui-splitter-panel>` children; drag the gutter
 * between two panels to resize them. `orientation` runs the panels horizontally
 * (default) or vertically. Sizes are percentages; `sizeChange` emits them.
 *
 * ```html
 * <xui-splitter class="h-64">
 *   <xui-splitter-panel [defaultSize]="30" [min]="15">Sidebar</xui-splitter-panel>
 *   <xui-splitter-panel>Content</xui-splitter-panel>
 * </xui-splitter>
 * ```
 */
@Component({
  selector: 'xui-splitter',
  imports: [NgTemplateOutlet],
  template: `
    @for (panel of panels(); track $index; let i = $index, last = $last) {
      <div
        class="min-h-0 min-w-0 overflow-auto"
        [style.flex-basis.%]="sizes()[i]"
        [style.flex-grow]="0"
        [style.flex-shrink]="1"
      >
        <ng-container [ngTemplateOutlet]="panel.content()" />
      </div>
      @if (!last) {
        <!-- Gutter: drag or arrow-key to resize the two adjacent panels. A
             focusable separator carries the size of the panel before it. -->
        <div
          role="separator"
          tabindex="0"
          [attr.aria-orientation]="orientation() === 'vertical' ? 'horizontal' : 'vertical'"
          [attr.aria-label]="'Resize panel ' + (i + 1)"
          [attr.aria-valuenow]="Math.round(sizes()[i])"
          [attr.aria-valuemin]="Math.round(panels()[i].min())"
          [attr.aria-valuemax]="Math.round(panels()[i].max())"
          [class]="gutterClass()"
          (mousedown)="startDrag(i, $event)"
          (keydown)="onGutterKeydown(i, $event)"
        >
          <span [class]="gutterHandleClass()"></span>
        </div>
      }
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiSplitter {
  private readonly el = inject(ElementRef).nativeElement as HTMLElement;
  private readonly document = this.el.ownerDocument;
  private readonly direction = injectXDirection();

  readonly class = input<ClassValue>('');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  readonly sizeChange = output<number[]>();

  protected readonly panels = contentChildren(XuiSplitterPanel);

  private readonly initialSizes = computed(() => {
    const panels = this.panels();
    const defined = panels.map(p => p.defaultSize());
    const definedSum = defined.reduce((sum, size) => sum + (size > 0 ? size : 0), 0);
    const autoCount = defined.filter(size => size <= 0).length;
    const autoSize = autoCount > 0 ? Math.max(0, (100 - definedSum) / autoCount) : 0;
    return defined.map(size => (size > 0 ? size : autoSize));
  });

  /** Current pane sizes (percentages); resets when the panel set changes. */
  protected readonly sizes = linkedSignal(() => this.initialSizes());

  /** Exposed for the `aria-value*` rounding in the template. */
  protected readonly Math = Math;

  /**
   * Move the gutter by a step, clamped the same way a drag is. Arrow keys step
   * by 1%, Shift by 10%, Home/End collapse to the adjacent panel's bound.
   */
  protected onGutterKeydown(gutter: number, event: KeyboardEvent): void {
    const vertical = this.orientation() === 'vertical';
    const step = event.shiftKey ? 10 : 1;
    let deltaPct: number;

    // Only the arrows along the splitter's own axis move it, and the horizontal
    // pair mirrors in RTL so the gutter always follows the key you can see.
    const arrow = arrowDirectionOnAxis(event.key, this.direction(), vertical ? 'vertical' : 'horizontal');

    if (arrow) {
      deltaPct = arrow === 'next' ? step : -step;
    } else if (event.key === 'Home') {
      deltaPct = -100;
    } else if (event.key === 'End') {
      deltaPct = 100;
    } else {
      return;
    }

    event.preventDefault();
    this.resize(gutter, deltaPct);
  }

  /** Apply a delta to the two panels either side of `gutter`, honouring min/max. */
  private resize(gutter: number, requested: number): void {
    const start = [...this.sizes()];
    const panels = this.panels();
    const a = gutter;
    const b = gutter + 1;

    let deltaPct = requested;
    deltaPct = Math.max(deltaPct, panels[a].min() - start[a], start[b] - panels[b].max());
    deltaPct = Math.min(deltaPct, panels[a].max() - start[a], start[b] - panels[b].min());

    const next = [...start];
    next[a] = start[a] + deltaPct;
    next[b] = start[b] - deltaPct;
    this.sizes.set(next);
    this.sizeChange.emit(next);
  }

  protected startDrag(gutter: number, event: MouseEvent): void {
    event.preventDefault();
    const vertical = this.orientation() === 'vertical';
    const containerPx = vertical ? this.el.clientHeight : this.el.clientWidth;
    const startPos = vertical ? event.clientY : event.clientX;
    const start = [...this.sizes()];
    const panels = this.panels();

    // Dragging towards the inline end grows the leading panel; in RTL that is
    // leftwards, so the horizontal delta is negated.
    const inlineSign = !vertical && this.direction() === 'rtl' ? -1 : 1;

    const onMove = (moveEvent: MouseEvent): void => {
      const pos = vertical ? moveEvent.clientY : moveEvent.clientX;
      let deltaPct = (((pos - startPos) * inlineSign) / containerPx) * 100;

      // Clamp so neither adjacent panel breaks its min/max.
      const a = gutter;
      const b = gutter + 1;
      const aMin = panels[a].min();
      const aMax = panels[a].max();
      const bMin = panels[b].min();
      const bMax = panels[b].max();
      deltaPct = Math.max(deltaPct, aMin - start[a], start[b] - bMax);
      deltaPct = Math.min(deltaPct, aMax - start[a], start[b] - bMin);

      const next = [...start];
      next[a] = start[a] + deltaPct;
      next[b] = start[b] - deltaPct;
      this.sizes.set(next);
    };
    const onUp = (): void => {
      this.stopDrag?.();
      this.sizeChange.emit(this.sizes());
    };
    this.stopDrag = () => {
      this.document.removeEventListener('mousemove', onMove);
      this.document.removeEventListener('mouseup', onUp);
      this.stopDrag = null;
    };
    this.document.addEventListener('mousemove', onMove);
    this.document.addEventListener('mouseup', onUp);
  }

  /** Removes the active drag listeners; destroying the component mid-drag must not leak them. */
  private stopDrag: (() => void) | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopDrag?.());
  }

  protected readonly computedClass = computed(() =>
    xui('flex overflow-hidden', this.orientation() === 'vertical' ? 'flex-col' : 'flex-row', this.class())
  );
  protected readonly gutterClass = computed(() =>
    xui(
      'group relative z-10 flex shrink-0 items-center justify-center',
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus',
      this.orientation() === 'vertical' ? 'h-1.5 w-full cursor-row-resize' : 'w-1.5 cursor-col-resize'
    )
  );
  protected readonly gutterHandleClass = computed(() =>
    xui(
      'bg-border group-hover:bg-primary rounded-full transition-colors',
      this.orientation() === 'vertical' ? 'h-0.5 w-8' : 'h-8 w-0.5'
    )
  );
}
