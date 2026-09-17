import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiLinkImports } from '@xui/link';
import { XuiTextImports } from '@xui/text';
import { VERSION } from '../../generated/manifest';

/** The one-line footer the docs pages share, or the full sitemap the landing page closes on. */
export type SiteFooterVariant = 'docs' | 'landing';

const DOCS_LINKS = [
  { label: 'Getting started', path: '/docs/getting-started' },
  { label: 'Theming', path: '/docs/theming' },
  { label: 'Theme builder', path: '/docs/theme-builder' },
  { label: 'Components', path: '/docs/components' },
  { label: 'MCP server and agent skill', path: '/docs/ai-agents' }
];

const PROJECT_LINKS = [
  { label: 'GitHub', href: 'https://github.com/Rikarin/xui' },
  { label: 'npm', href: 'https://www.npmjs.com/org/xui' },
  { label: 'Storybook', href: 'https://develop--67d2b4c756077a325913e5d9.chromatic.com/?globals=theme:dark' },
  { label: 'StackBlitz', href: 'https://stackblitz.com/fork/xui' },
  { label: 'Releases', href: 'https://github.com/Rikarin/xui/releases' }
];

@Component({
  selector: 'docs-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, XuiLinkImports, XuiTextImports],
  host: { '[class]': 'hostClass()' },
  template: `
    @if (landing()) {
      <div class="mx-auto max-w-[100rem] px-4 py-14 sm:px-6">
        <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div class="max-w-sm">
            <a routerLink="/" class="inline-flex items-center font-semibold tracking-tight">
              <span class="text-primary text-xl">x</span><span class="text-xl">UI</span>
            </a>
            <p xuiText color="muted" size="sm" class="mt-3">
              Angular 22 components styled with Tailwind CSS 4. One npm package per component, all of them themed from a
              single token layer.
            </p>
            <p xuiText color="subtle" size="sm" class="mt-4">
              {{ version }} — Apache 2.0 licensed. Built with Angular and Tailwind CSS.
            </p>
          </div>

          <nav aria-label="Documentation">
            <p xuiText weight="medium" size="sm" class="mb-3">Documentation</p>
            <ul class="flex flex-col gap-2">
              @for (item of docs; track item.path) {
                <li>
                  <a
                    xuiLink
                    color="inherit"
                    underline="hover"
                    [routerLink]="item.path"
                    class="text-foreground-muted hover:text-foreground text-sm"
                    >{{ item.label }}</a
                  >
                </li>
              }
            </ul>
          </nav>

          <nav aria-label="Project">
            <p xuiText weight="medium" size="sm" class="mb-3">Project</p>
            <ul class="flex flex-col gap-2">
              @for (item of project; track item.href) {
                <li>
                  <a
                    xuiLink
                    color="inherit"
                    underline="hover"
                    class="text-foreground-muted hover:text-foreground text-sm"
                    [href]="item.href"
                    rel="noreferrer noopener"
                    target="_blank"
                    >{{ item.label }}</a
                  >
                </li>
              }
            </ul>
          </nav>
        </div>
      </div>
    } @else {
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
    }
  `
})
export class SiteFooter {
  protected readonly version = VERSION;
  protected readonly docs = DOCS_LINKS;
  protected readonly project = PROJECT_LINKS;

  readonly variant = input<SiteFooterVariant>('docs');

  protected readonly landing = computed(() => this.variant() === 'landing');

  protected readonly hostClass = computed(() =>
    this.landing() ? 'block border-t border-white/[0.06]' : 'border-border mt-16 block border-t'
  );
}
