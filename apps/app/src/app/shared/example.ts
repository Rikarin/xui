import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
 * It renders on viewport rather than on the server. A preview is a live demo, not content: several
 * components measure the DOM or construct a `ResizeObserver` on creation and cannot render without a
 * browser, and the heavy ones (a chart, a canvas, a node graph) have no business in the payload of a
 * page whose reader may never scroll to them. Everything that is documentation — the description,
 * the source, the API tables — is still server-rendered.
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
            class="border-border bg-background flex min-h-24 flex-wrap items-start gap-4 overflow-x-auto rounded-lg border p-6"
          >
            @defer (on viewport) {
              <ng-container [ngComponentOutlet]="example().preview!" />
            } @placeholder {
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
}
