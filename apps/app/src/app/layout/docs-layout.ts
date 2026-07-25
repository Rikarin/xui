import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XuiDrawerImports } from '@xui/drawer';
import { LayoutState } from '../core/layout-state';
import { DocsNav } from './docs-nav';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

/**
 * The documentation frame: a sticky header, a nav rail that becomes a drawer under `lg`, and the
 * page itself. Nothing here is fixed-width — the rail collapses first, the table of contents goes
 * at `xl`, and the article keeps a readable measure at every size down to 320px.
 */
@Component({
  selector: 'docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, XuiDrawerImports, DocsNav, SiteHeader, SiteFooter],
  template: `
    <docs-site-header [showMenuButton]="true" />

    <div class="mx-auto flex max-w-[100rem] px-4 sm:px-6">
      <aside class="hidden w-60 shrink-0 lg:block">
        <div class="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pe-4">
          <docs-nav />
        </div>
      </aside>

      <main class="min-w-0 flex-1 py-8 lg:ps-8" id="main">
        <router-outlet />
      </main>
    </div>

    <docs-site-footer />

    <xui-drawer title="Documentation" position="left" size="md" [(isOpen)]="layout.mobileNavOpen" class="lg:hidden">
      <docs-nav class="p-4" />
    </xui-drawer>
  `
})
export class DocsLayout {
  protected readonly layout = inject(LayoutState);
}
