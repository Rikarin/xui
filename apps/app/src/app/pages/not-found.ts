import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiButtonImports } from '@xui/button';
import { XuiNonIdealStateImports } from '@xui/non-ideal-state';
import { SiteFooter } from '../layout/site-footer';
import { SiteHeader } from '../layout/site-header';

@Component({
  selector: 'docs-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, XuiButtonImports, XuiNonIdealStateImports, SiteHeader, SiteFooter],
  template: `
    <docs-site-header />

    <main id="main" class="mx-auto flex max-w-2xl items-center px-4 py-24 sm:px-6">
      <xui-non-ideal-state title="Page not found" description="That page does not exist, or it moved.">
        <a xuiButton routerLink="/docs/getting-started">Go to the docs</a>
      </xui-non-ideal-state>
    </main>

    <docs-site-footer />
  `
})
export class NotFound {}
