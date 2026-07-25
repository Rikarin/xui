import { NgComponentOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal
} from '@angular/core';
import { XuiTabsImports } from '@xui/tabs';
import { XuiTextImports } from '@xui/text';
import type { DocsExample } from '../core/docs.model';
import { CodeBlock } from './code-block';

/**
 * One story, rendered live and shown as source.
 *
 * The preview is the compiled component the generator built from the story, so what renders here is
 * the same code the Code tab shows — there is no second, hand-maintained copy to drift.
 *
 * It renders in the browser only. A preview is a live demo rather than content: several components
 * measure the DOM or construct a `ResizeObserver` when they are created and cannot render on the
 * server at all. `afterNextRender` runs once hydration has finished, so the server and the client
 * agree on the markup and nothing has to be skipped. Everything that is documentation — the
 * description, the source, the API tables — is still server-rendered.
 *
 * The frame scrolls only when its contents are genuinely too wide, because a scroll container clips
 * on both axes — CSS cannot scroll one and overflow the other. Left scrolling permanently on, a
 * cascader or colour picker (both of which position their panel themselves rather than through the
 * CDK overlay) has it cut off at the frame's edge; left permanently off, a 760px-wide data table
 * pushes the whole page sideways.
 */
@Component({
  selector: 'docs-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, XuiTabsImports, XuiTextImports, CodeBlock],
  host: { class: 'block' },
  template: `
    <h3 xuiHeading [level]="3" class="mb-3 scroll-mt-24" [id]="anchor()">
      {{ example().title }}
    </h3>

    @if (example().preview) {
      <xui-tabs [selectedTabId]="'preview-' + anchor()">
        <xui-tab [id]="'preview-' + anchor()" title="Preview">
          <div
            data-preview-frame
            class="border-border bg-background flex min-h-24 flex-wrap items-start gap-4 rounded-lg border p-6"
            [class.overflow-x-auto]="scrollable()"
          >
            @if (rendered()) {
              <ng-container [ngComponentOutlet]="example().preview!" />
            } @else {
              <span class="text-foreground-subtle text-sm">Loading preview…</span>
            }
          </div>
        </xui-tab>
        <xui-tab [id]="'code-' + anchor()" title="Code">
          <docs-code [code]="example().code" lang="html" />
        </xui-tab>
      </xui-tabs>
    } @else {
      <docs-code [code]="example().code" lang="html" />
    }
  `
})
export class Example {
  readonly example = input.required<DocsExample>();
  /** Stable id for the heading and the tab group — tab ids have to be unique across the page. */
  readonly anchor = input.required<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rendered = signal(false);
  protected readonly scrollable = signal(false);

  constructor() {
    afterNextRender(() => {
      this.rendered.set(true);

      // One frame later: the preview mounts during the change detection this very call schedules,
      // so measuring now would always report that it fits.
      requestAnimationFrame(() => this.measure());

      const remeasure = () => this.measure();

      window.addEventListener('resize', remeasure, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', remeasure));
    });
  }

  /**
   * The frame is looked up by attribute rather than by a view query: it is projected into a tab
   * panel, which the query does not resolve through, and the DOM node always does.
   */
  private measure(): void {
    const frame = (this.host.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-preview-frame]');

    if (frame) {
      this.scrollable.set(frame.scrollWidth > frame.clientWidth);
    }
  }
}
