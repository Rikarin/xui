import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matLinkRound } from '@ng-icons/material-icons/round';
import { XuiIconImports } from '@xui/icon';
import { PagePath } from './page-path';

/**
 * How far down the window a heading lands when a link jumps to it: half the viewport, less half a
 * heading, which leaves it in the middle of the screen rather than tucked under the sticky header.
 *
 * Two things have to agree on this. The router's anchor scrolling reads it through
 * `ViewportScroller.setOffset`, and the browser's own scroll — the one that runs on a page loaded
 * with a fragment already in the URL, before Angular is on its feet — reads the `scroll-mt` below.
 */
export const HEADING_SCROLL_OFFSET = () => window.innerHeight / 2 - 24;

/**
 * Makes a heading a linkable section: it carries the anchor id, and on hover or keyboard focus it
 * shows a link to itself.
 *
 * ```html
 * <h2 xuiHeading [level]="2" docsAnchor="install">Install</h2>
 * ```
 *
 * An attribute-selector component rather than a directive, because the link is projected content
 * next to the heading's own text — and rather than a wrapper element, because the document keeps a
 * real `<h2>`, which is what the outline and the on-this-page list are built on.
 *
 * The id comes from the component's own input instead of a separate `id` attribute so a heading
 * cannot end up with an anchor the link does not point at.
 */
@Component({
  // The prefix is on the attribute — the rule only reads the element part of a compound selector.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'h2[docsAnchor],h3[docsAnchor],h4[docsAnchor]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, XuiIconImports],
  providers: [provideIcons({ matLinkRound })],
  host: {
    class: 'group scroll-mt-[calc(50vh-1.5rem)]',
    '[id]': 'docsAnchor()'
  },
  template: `
    <ng-content />
    <a
      class="text-foreground-subtle hover:text-foreground ms-2 inline-flex align-middle opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      aria-label="Link to this section"
      [routerLink]="path()"
      [fragment]="docsAnchor()"
    >
      <ng-icon xui size="sm" name="matLinkRound" />
    </a>
  `
})
export class HeadingAnchor {
  /** The heading's anchor id, which becomes both the element's `id` and the link's fragment. */
  readonly docsAnchor = input.required<string>();

  protected readonly path = inject(PagePath).value;
}
