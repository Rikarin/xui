import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiLinkImports } from '@xui/link';
import { XuiTextImports } from '@xui/text';
import { VERSION } from '../../generated/manifest';

@Component({
  selector: 'docs-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, XuiLinkImports, XuiTextImports],
  host: { class: 'border-border mt-16 block border-t' },
  template: `
    <div
      class="mx-auto flex max-w-[100rem] flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between"
    >
      <p xuiText color="muted" size="sm">
        xUI {{ version }} — Apache 2.0 licensed. Built with Angular and Tailwind CSS.
      </p>

      <nav class="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
        <a xuiLink underline="hover" routerLink="/docs/getting-started" xuiText size="sm">Docs</a>
        <a xuiLink underline="hover" routerLink="/docs/components" xuiText size="sm">Components</a>
        <a
          xuiLink
          underline="hover"
          xuiText
          size="sm"
          href="https://github.com/Rikarin/xui"
          rel="noreferrer noopener"
          target="_blank"
          >GitHub</a
        >
        <a
          xuiLink
          underline="hover"
          xuiText
          size="sm"
          href="https://www.npmjs.com/org/xui"
          rel="noreferrer noopener"
          target="_blank"
          >npm</a
        >
      </nav>
    </div>
  `
})
export class SiteFooter {
  protected readonly version = VERSION;
}
