import { NgComponentOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  type Type
} from '@angular/core';
import { XuiTabsImports } from '@xui/tabs';
import { XuiTextImports } from '@xui/text';
import type { DocsExample } from '../core/docs.model';
import { PREVIEW_MODULES } from '../core/previews';
import { CodeBlock } from './code-block';
import { HeadingAnchor } from './heading-anchor';

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
 * The frame lays its preview out in normal flow. It used to be a flex row, from when a story's
 * markup was inlined into it and its roots were the flex items; the outlet puts a single component
 * element there instead, and a lone flex item is sized by its content — which collapsed anything
 * sized in percentages, a progress bar or a slider, to nothing at all.
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
  imports: [NgComponentOutlet, XuiTabsImports, XuiTextImports, CodeBlock, HeadingAnchor],
  host: { class: 'block' },
  template: `
    <h3 xuiHeading [level]="3" class="mb-3" [docsAnchor]="anchor()">
      {{ example().title }}
    </h3>

    @if (example().previewName) {
      <xui-tabs [selectedTabId]="'preview-' + anchor()">
        <xui-tab [id]="'preview-' + anchor()" title="Preview">
          <div
            data-preview-frame
            class="border-border bg-background min-h-24 rounded-lg border p-6"
            [class.overflow-x-auto]="scrollable()"
          >
            @if (preview(); as component) {
              <ng-container [ngComponentOutlet]="component" />
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
      <p xuiText color="subtle" size="sm" class="mb-2">
        Source only — this one needs a component of its own to run, so there is nothing to render here.
      </p>
      <docs-code [code]="example().code" lang="html" />
    }
  `
})
export class Example {
  readonly example = input.required<DocsExample>();
  /** Stable id for the heading and the tab group — tab ids have to be unique across the page. */
  readonly anchor = input.required<string>();
  /** The component's slug, which is the key its demos are keyed by. */
  readonly slug = input.required<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modules = inject(PREVIEW_MODULES, { optional: true });

  private readonly hydrated = signal(false);

  protected readonly preview = signal<Type<unknown> | null>(null);
  protected readonly scrollable = signal(false);

  constructor() {
    afterNextRender(() => {
      this.hydrated.set(true);

      const remeasure = () => this.measure();

      window.addEventListener('resize', remeasure, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', remeasure));
    });

    // Per example *and* per navigation: the list tracks by story name, so walking from one component
    // to the next hands this same instance a new example — "Default" on both pages is one component
    // that changed its input. Loading once, on render, left the page before last on screen.
    effect(() => {
      const slug = this.slug();
      const name = this.example().previewName;

      if (this.hydrated()) {
        untracked(() => void this.load(slug, name));
      }
    });
  }

  /**
   * Fetches the package's demo chunk and picks this example's component out of it.
   *
   * The registry is browser-only, so on the server there is nothing to load and the frame keeps its
   * placeholder — which is what it did before hydration anyway.
   */
  private async load(slug: string, name: string | undefined): Promise<void> {
    // Down first, so the previous page's demo goes with the navigation rather than lingering under
    // the new heading until its replacement arrives.
    this.preview.set(null);

    const loader = this.modules?.[slug];

    if (!name || !loader) {
      return;
    }

    const module = await loader();

    // The chunk was in flight; anything could have happened to the page since.
    if (this.slug() !== slug || this.example().previewName !== name) {
      return;
    }

    this.preview.set(module[name] ?? null);

    // One frame later: the preview mounts during the change detection this very call schedules, so
    // measuring now would always report that it fits.
    requestAnimationFrame(() => this.measure());
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
