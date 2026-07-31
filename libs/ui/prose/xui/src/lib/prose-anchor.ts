import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matLinkRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';

/**
 * Makes a heading a linkable section: it carries the anchor id, and on hover or
 * keyboard focus it offers a link to itself.
 *
 * ```html
 * <h2 xuiProseAnchor="install">Install</h2>
 * ```
 *
 * An attribute-selector component rather than a directive, because the link is
 * content beside the heading's own text — and rather than a wrapper element,
 * because the document keeps a real `<h2>`, which is what an outline and a
 * table of contents are built from.
 *
 * The id comes from this input rather than a separate `id` attribute, so a
 * heading cannot end up with an anchor its own link does not point at. The link
 * is a plain fragment `href`, which needs no router; project an element into the
 * `xuiProseAnchorLink` slot to navigate some other way. The heading also carries
 * enough `scroll-margin` to clear a sticky header when a jump lands on it.
 */
@Component({
  // The prefix is on the attribute — the rule only reads the element part of a compound selector.
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'h1[xuiProseAnchor],h2[xuiProseAnchor],h3[xuiProseAnchor],h4[xuiProseAnchor],h5[xuiProseAnchor],h6[xuiProseAnchor]',
  imports: [NgIcon, XuiIcon],
  providers: [provideIcons({ matLinkRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[id]': 'xuiProseAnchor()',
    '[class]': 'computedClass()'
  },
  template: `
    <ng-content />
    <ng-content select="[xuiProseAnchorLink]">
      <a
        class="text-foreground-subtle hover:text-foreground focus-visible:outline-focus ms-2 inline-flex rounded-sm align-middle opacity-0 transition-opacity group-hover/anchor:opacity-100 focus-visible:opacity-100 focus-visible:outline-2"
        [href]="selfHref()"
        [attr.aria-label]="linkLabel()"
      >
        <ng-icon xui size="sm" name="matLinkRound" />
      </a>
    </ng-content>
  `
})
export class XuiProseAnchor {
  private readonly document = inject(DOCUMENT);

  /** The heading's anchor id — both the element's `id` and the link's fragment. */
  readonly xuiProseAnchor = input.required<string>();

  /** Accessible name of the self-link. */
  readonly linkLabel = input<string>('Link to this section');

  /**
   * Path the fragment hangs off. Defaults to the page the heading is on.
   *
   * Not a bare `#id`, which resolves against the document's base URL: an Angular
   * application ships `<base href="/">`, so every anchor on every page but the
   * root would quietly point at the site root instead of down the page. Set this
   * when the heading's page is not the one in the address bar.
   */
  readonly basePath = input<string | null>(null);

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /**
   * A method rather than a computed: the location is not a signal, so caching it
   * would leave a heading that outlives a navigation pointing at the page it was
   * first rendered on.
   */
  protected selfHref(): string {
    const base = this.basePath();
    const id = this.xuiProseAnchor();

    if (base !== null) {
      return `${base}#${id}`;
    }

    const { pathname, search } = this.document.location;

    return `${pathname}${search}#${id}`;
  }

  protected readonly computedClass = computed(() =>
    // `scroll-mt` has to agree with whatever offset the page scrolls headings
    // to; half the viewport puts a jumped-to heading in the middle of the screen
    // rather than under a sticky header.
    xui('group/anchor scroll-mt-[calc(50vh-1.5rem)]', this.class())
  );
}
