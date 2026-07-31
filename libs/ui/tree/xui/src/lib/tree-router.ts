import { isPlatformBrowser } from '@angular/common';
import { computed, Directive, effect, inject, input, PLATFORM_ID, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, type IsActiveMatchOptions } from '@angular/router';
import { collectTreePaths } from '@xui/core/tree';
import { filter, map } from 'rxjs';
import { XuiTree } from './tree';
import type { XuiTreeNode } from './tree.types';

/** How much of the URL a node's link has to account for to count as active. */
export type XuiTreeRouterMatch = 'exact' | 'prefix';

const MATCH_OPTIONS: Record<XuiTreeRouterMatch, IsActiveMatchOptions> = {
  exact: { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' },
  prefix: { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }
};

/** Where a node keeps its URL, unless `nodeLink` says otherwise. */
const defaultNodeLink = (node: XuiTreeNode): string | null => {
  const data = node.data as { link?: string; url?: string; href?: string } | undefined;

  return data?.link ?? data?.url ?? data?.href ?? null;
};

/**
 * Makes a `xui-tree` follow the router: the node whose link matches the current
 * URL becomes selected and `aria-current="page"`, and everything above it opens
 * so it is on screen.
 *
 * ```html
 * <xui-tree xuiTreeRouter [nodes]="pages()" persistKey="docs-nav" (nodeClick)="go($event)" />
 * ```
 *
 * A directive rather than a tree of its own, so an application that wants a
 * navigation tree does not get a second component to learn — and so this can be
 * left off, which is what keeps `@angular/router` optional for everyone else.
 *
 * Navigating is deliberately not its job: it reads the URL and never writes one.
 * Handle `(nodeClick)` — or render the label as a `routerLink` through the
 * node's own template — so the tree's idea of a link and the application's stay
 * the same one.
 *
 * Expansion survives navigation because it lives in the tree's `expandedIds`;
 * with a `persistKey` it survives a reload as well.
 */
@Directive({
  selector: 'xui-tree[xuiTreeRouter]',
  exportAs: 'xuiTreeRouter'
})
export class XuiTreeRouter {
  private readonly tree = inject(XuiTree, { self: true });
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** A node's URL. Defaults to `data.link`, then `data.url`, then `data.href`. */
  readonly nodeLink = input<(node: XuiTreeNode) => string | null | undefined>(defaultNodeLink);

  /**
   * Whether a node's link has to be the whole URL or only its start.
   *
   * `prefix` is what a documentation sidebar wants — `/docs/ecs` should light up
   * while you are on `/docs/ecs/queries` — and the deepest match still wins, so
   * the child rather than the section is the one marked current.
   */
  readonly match = input<XuiTreeRouterMatch>('prefix');

  /** Also open the ancestors of the active node, so it is never hidden. */
  readonly revealActive = input(true);

  /**
   * Remember which nodes are open under this key, in `sessionStorage`.
   *
   * `null` — the default — keeps expansion for as long as the tree is alive,
   * which already covers navigating around a shell that does not tear it down.
   */
  readonly persistKey = input<string | null>(null);

  /** The URL as a signal, so everything below recomputes when it changes. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  /**
   * The path to the node the URL is pointing at, that node last.
   *
   * Under `prefix` a section and the page inside it both match, so the hits are
   * ranked rather than taken in order: an exact match beats a prefix, and among
   * prefixes the longest link wins. Otherwise `/docs` would light up for every
   * page in the documentation purely by sitting nearest the root.
   */
  readonly activePath = computed<readonly XuiTreeNode[]>(() => {
    // A dependency, not a value: `isActive` reads the router's current state.
    this.url();

    const link = this.nodeLink();
    const options = MATCH_OPTIONS[this.match()];

    const ranked = collectTreePaths(this.tree.nodes(), node => {
      const target = link(node);

      return !!target && this.router.isActive(target, options);
    })
      .map(path => {
        const target = link(path[path.length - 1]) ?? '';

        return {
          path,
          score: this.router.isActive(target, MATCH_OPTIONS.exact) ? 1 : 0,
          length: target.length
        };
      })
      .sort((a, b) => b.score - a.score || b.length - a.length);

    return ranked[0]?.path ?? [];
  });

  /** The active node, or `null` when the URL is nowhere in the tree. */
  readonly activeNode = computed<XuiTreeNode | null>(() => this.activePath().at(-1) ?? null);

  private restored = false;

  constructor() {
    effect(() => {
      const path = this.activePath();

      untracked(() => {
        const active = path.at(-1);

        if (!active) {
          return;
        }

        this.tree.selectedId.set(active.id);
        this.tree.currentId.set(active.id);

        if (this.revealActive()) {
          // The node itself is left alone: opening it would show its children,
          // which is a different thing from making it visible.
          this.tree.expand(...path.slice(0, -1).map(node => node.id));
        }
      });
    });

    // Read once, then write on every change. In an effect rather than the
    // constructor because that is the first place an input has its bound value —
    // and it runs after the tree has seeded itself, so a remembered set wins
    // over the `isExpanded` flags, which is the point of remembering it.
    effect(() => {
      const key = this.persistKey();
      const expanded = this.tree.expandedIds();

      untracked(() => {
        if (!this.restored) {
          this.restored = true;
          this.restore(key);

          return;
        }

        this.persist(key, expanded);
      });
    });
  }

  private storage(): Storage | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      return sessionStorage;
    } catch {
      // Blocked by a privacy setting. Expansion still works, it just does not
      // outlive the page.
      return null;
    }
  }

  private restore(key: string | null): void {
    const raw = key ? this.storage()?.getItem(`xui-tree:${key}`) : null;

    if (!raw) {
      return;
    }

    try {
      const ids: unknown = JSON.parse(raw);

      if (Array.isArray(ids)) {
        this.tree.expandedIds.set(ids as (string | number)[]);
      }
    } catch {
      // Corrupt entry from an older shape of the data. Start closed.
    }
  }

  private persist(key: string | null, expanded: readonly (string | number)[]): void {
    if (!key) {
      return;
    }

    try {
      this.storage()?.setItem(`xui-tree:${key}`, JSON.stringify(expanded));
    } catch {
      // Quota, or a storage that refuses writes. Not worth failing a render for.
    }
  }
}
