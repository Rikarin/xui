import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  PLATFORM_ID,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiTocConfig } from './toc.token';
import type { XuiTocEntry } from './toc.types';

export const tocVariants = cva(['block min-w-0'], {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export type XuiTocVariants = VariantProps<typeof tocVariants>;

/** How far each heading level is indented, in rem. */
const INDENT_PER_LEVEL = 0.75;

/**
 * The in-page outline: a list of the document's headings, with the one you are
 * reading marked.
 *
 * ```html
 * <xui-toc [entries]="headings()" class="sticky top-20" />
 * ```
 *
 * Links are plain fragment `href`s, so this needs no router and works on a
 * prerendered page with no JavaScript at all — which for a documentation site is
 * the point. What JavaScript adds is the highlight: an `IntersectionObserver`
 * over the real headings moves `activeId` as the page scrolls.
 *
 * The observer watches elements this component does not own — it finds them by
 * the ids in `entries`. A heading that is not in the document is skipped rather
 * than treated as an error, because an outline is often built before the content
 * it describes has finished rendering.
 */
@Component({
  selector: 'xui-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <nav [attr.aria-label]="navLabel()">
      @if (label(); as heading) {
        <p class="text-foreground-subtle mb-2 text-xs font-semibold tracking-wide uppercase">{{ heading }}</p>
      }

      <ul class="border-border m-0 list-none space-y-1 border-s p-0 ps-3">
        @for (entry of visibleEntries(); track entry.id) {
          <li [style.padding-inline-start.rem]="indentOf(entry)">
            <a
              [href]="hrefFor(entry)"
              [class]="linkClass(entry)"
              [attr.aria-current]="entry.id === activeId() ? 'location' : null"
              (click)="entrySelected.emit(entry)"
              >{{ entry.label }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiToc {
  private readonly config = injectXuiTocConfig();
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The document's headings, in document order. */
  readonly entries = input<readonly XuiTocEntry[]>([]);

  /**
   * The heading being read. Two-way bindable; scroll-spy writes it, and setting
   * it from outside — from a route fragment, say — moves the highlight.
   */
  readonly activeId = model<string | null>(null);

  /** Shallowest heading level to list. `<h1>` is the page title, so the default starts at `<h2>`. */
  readonly minLevel = input<number, NumberInput>(2, { transform: numberAttribute });

  /** Deepest heading level to list. Past `<h3>` an outline is longer than the page. */
  readonly maxLevel = input<number, NumberInput>(3, { transform: numberAttribute });

  /** Heading above the list. `null` hides it; the nav keeps its accessible name either way. */
  readonly label = input<string | null>('On this page');

  /** Accessible name for the nav landmark. Defaults to `label`, which is usually the right answer. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /** Follow the scroll position. Turn it off when something else owns `activeId`. */
  readonly scrollSpy = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /**
   * The band a heading has to be in to count as current, as an
   * `IntersectionObserver` root margin. The default ignores the bottom 70% of
   * the viewport, so the current section is the one at the top of the screen
   * rather than whichever is merely visible.
   */
  readonly rootMargin = input<string>('0px 0px -70% 0px');

  /**
   * Path the fragments hang off. Defaults to the page the outline is describing.
   *
   * Not a bare `#id`, which resolves against the document's base URL: an Angular
   * application ships `<base href="/">`, so every entry on every page but the
   * root would quietly point at the site root instead of down the page.
   */
  readonly basePath = input<string | null>(null);

  /** Type scale of the outline. */
  readonly size = input<XuiTocVariants['size']>(this.config.size);

  /** Emits the entry whose link was clicked. The navigation itself is the browser's. */
  readonly entrySelected = output<XuiTocEntry>();

  /** The entries within `minLevel`…`maxLevel`, in document order. */
  protected readonly visibleEntries = computed(() =>
    this.entries().filter(entry => entry.level >= this.minLevel() && entry.level <= this.maxLevel())
  );

  /** A landmark has to be named; the visible heading is that name unless one is given. */
  protected readonly navLabel = computed(() => this.ariaLabel() ?? this.label() ?? 'Table of contents');

  protected readonly computedClass = computed(() => xui(tocVariants({ size: this.size() }), this.class()));

  constructor() {
    // After render, because the headings belong to the page rather than to this
    // view, and are only in the document once the page itself has rendered.
    afterRenderEffect(onCleanup => {
      const entries = this.visibleEntries();
      const rootMargin = this.rootMargin();

      if (!this.isBrowser || !this.scrollSpy() || !entries.length || typeof IntersectionObserver === 'undefined') {
        return;
      }

      const ids = entries.map(entry => entry.id);
      const onScreen = new Set<string>();

      const observer = new IntersectionObserver(
        records => {
          for (const record of records) {
            const id = (record.target as HTMLElement).id;

            if (record.isIntersecting) {
              onScreen.add(id);
            } else {
              onScreen.delete(id);
            }
          }

          // The first heading in document order that is inside the band. When
          // none is — a section taller than the band — the previous one stands,
          // which is what a reader in the middle of a long section expects.
          const current = ids.find(id => onScreen.has(id));

          if (current) {
            untracked(() => this.activeId.set(current));
          }
        },
        { rootMargin, threshold: 0 }
      );

      for (const id of ids) {
        const heading = this.document.getElementById(id);

        if (heading) {
          observer.observe(heading);
        }
      }

      onCleanup(() => observer.disconnect());
    });
  }

  /**
   * A method rather than a computed: the location is not a signal, so caching it
   * would leave an outline that outlives a navigation pointing at the page it
   * was first rendered on.
   */
  protected hrefFor(entry: XuiTocEntry): string {
    const base = this.basePath();

    if (base !== null) {
      return `${base}#${entry.id}`;
    }

    const { pathname, search } = this.document.location;

    return `${pathname}${search}#${entry.id}`;
  }

  protected indentOf(entry: XuiTocEntry): number {
    return Math.max(0, entry.level - this.minLevel()) * INDENT_PER_LEVEL;
  }

  protected linkClass(entry: XuiTocEntry): string {
    return xui(
      'text-foreground-muted hover:text-foreground focus-visible:outline-focus block truncate rounded-sm transition-colors focus-visible:outline-2',
      entry.id === this.activeId() && 'text-primary font-medium'
    );
  }
}
