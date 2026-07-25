import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiSplitterPanel } from './splitter-panel';

/**
 * Resizable split panes. Wrap `<xui-splitter-panel>` children; drag the gutter
 * between two panels to resize them. `layout` runs the panels horizontally
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
      <div class="min-h-0 min-w-0 overflow-auto" [style.flex-basis.%]="sizes()[i]" [style.flex-grow]="0" [style.flex-shrink]="1">
        <ng-container [ngTemplateOutlet]="panel.content()" />
      </div>
      @if (!last) {
        <!-- Gutter: drag to resize the two adjacent panels. -->
        <div
          role="separator"
          [attr.aria-orientation]="layout() === 'vertical' ? 'horizontal' : 'vertical'"
          [class]="gutterClass()"
          (mousedown)="startDrag(i, $event)"
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

  readonly class = input<ClassValue>('');
  readonly layout = input<'horizontal' | 'vertical'>('horizontal');

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

  protected startDrag(gutter: number, event: MouseEvent): void {
    event.preventDefault();
    const vertical = this.layout() === 'vertical';
    const containerPx = vertical ? this.el.clientHeight : this.el.clientWidth;
    const startPos = vertical ? event.clientY : event.clientX;
    const start = [...this.sizes()];
    const panels = this.panels();

    const onMove = (moveEvent: MouseEvent): void => {
      const pos = vertical ? moveEvent.clientY : moveEvent.clientX;
      let deltaPct = ((pos - startPos) / containerPx) * 100;

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
      this.document.removeEventListener('mousemove', onMove);
      this.document.removeEventListener('mouseup', onUp);
      this.sizeChange.emit(this.sizes());
    };
    this.document.addEventListener('mousemove', onMove);
    this.document.addEventListener('mouseup', onUp);
  }

  protected readonly computedClass = computed(() =>
    xui('flex overflow-hidden', this.layout() === 'vertical' ? 'flex-col' : 'flex-row', this.class())
  );
  protected readonly gutterClass = computed(() =>
    xui(
      'group relative z-10 flex shrink-0 items-center justify-center',
      this.layout() === 'vertical' ? 'h-1.5 w-full cursor-row-resize' : 'w-1.5 cursor-col-resize'
    )
  );
  protected readonly gutterHandleClass = computed(() =>
    xui(
      'bg-border group-hover:bg-primary rounded-full transition-colors',
      this.layout() === 'vertical' ? 'h-0.5 w-8' : 'h-8 w-0.5'
    )
  );
}
