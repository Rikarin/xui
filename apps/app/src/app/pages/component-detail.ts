import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiCalloutImports } from '@xui/callout';
import { XuiLinkImports } from '@xui/link';
import { XuiProseImports } from '@xui/prose';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { XuiTocImports, type XuiTocEntry } from '@xui/toc';
import type { ComponentDoc } from '../core/docs.model';
import { ApiTable } from '../shared/api-table';
import { CodeBlock } from '../shared/code-block';
import { Example } from '../shared/example';

@Component({
  selector: 'docs-component-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    XuiCalloutImports,
    XuiLinkImports,
    XuiTagImports,
    XuiTextImports,
    ApiTable,
    CodeBlock,
    Example,
    XuiProseImports,
    XuiTocImports
  ],
  template: `
    @if (doc(); as doc) {
      <div class="flex gap-8">
        <article class="max-w-3xl min-w-0 flex-1">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <xui-tag minimal>{{ doc.group }}</xui-tag>
            @if (doc.kind === 'core') {
              <xui-tag minimal color="primary">headless</xui-tag>
            }
          </div>

          <h1 xuiHeading [level]="1">{{ doc.title }}</h1>
          <code xuiCode class="mt-2 inline-block">{{ doc.package }}</code>

          @if (doc.description; as description) {
            <p xuiText color="muted" size="lg" class="mt-4 max-w-2xl">{{ description }}</p>
          }

          <h2 xuiHeading [level]="2" class="mt-10 mb-3" xuiProseAnchor="install">Install</h2>
          <docs-code [code]="install()" lang="bash" />

          @if (doc.importsConst) {
            <p xuiText color="muted" size="sm" class="mt-4 mb-2">
              Add the barrel to a standalone component's <code xuiCode>imports</code>:
            </p>
            <docs-code [code]="importSnippet()" lang="ts" />
          }

          @if (doc.examples.length > 0) {
            <h2 xuiHeading [level]="2" class="mt-12 mb-4" xuiProseAnchor="examples">Examples</h2>
            <div class="space-y-10">
              @for (example of doc.examples; track example.name) {
                <docs-example [example]="example" [slug]="doc.slug" [anchor]="'example-' + example.name" />
              }
            </div>
          } @else {
            <h2 xuiHeading [level]="2" class="mt-12 mb-4" xuiProseAnchor="examples">Examples</h2>
            <xui-callout minimal>
              This package has no Storybook story yet, so there is nothing to render here. The API below is still
              extracted from the source.
            </xui-callout>
          }

          @if (doc.symbols.length > 0) {
            <h2 xuiHeading [level]="2" class="mt-12 mb-4" xuiProseAnchor="api">API</h2>
            <div class="space-y-12">
              @for (symbol of doc.symbols; track symbol.name) {
                <docs-api-table [symbol]="symbol" />
              }
            </div>
          }

          <h2 xuiHeading [level]="2" class="mt-12 mb-4" xuiProseAnchor="source">Source</h2>
          <p xuiText color="muted" size="sm">
            <a
              xuiLink
              [href]="'https://github.com/Rikarin/xui/tree/master/' + doc.sourcePath"
              rel="noreferrer noopener"
              target="_blank"
              >{{ doc.sourcePath }}</a
            >
          </p>
        </article>

        <xui-toc
          class="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 self-start overflow-y-auto xl:block"
          [entries]="toc()"
        />
      </div>
    } @else {
      <article class="max-w-2xl">
        <h1 xuiHeading [level]="1">Not found</h1>
        <p xuiText color="muted" class="mt-3">
          No component by that name. <a xuiLink routerLink="/docs/components">Browse all components</a>.
        </p>
      </article>
    }
  `
})
export class ComponentDetail {
  /** Bound from the route's `resolve`, via `withComponentInputBinding`. */
  readonly doc = input<ComponentDoc | undefined>(undefined);

  protected readonly install = computed(() => `pnpm add ${this.doc()?.package ?? ''}`);

  protected readonly importSnippet = computed(() => {
    const doc = this.doc();

    if (!doc?.importsConst) {
      return '';
    }

    return [
      `import { ${doc.importsConst} } from '${doc.package}';`,
      '',
      '@Component({',
      `  imports: [${doc.importsConst}],`,
      '  // …',
      '})'
    ].join('\n');
  });

  protected readonly toc = computed<XuiTocEntry[]>(() => {
    const doc = this.doc();

    if (!doc) {
      return [];
    }

    return [
      { id: 'install', label: 'Install', level: 2 as const },
      { id: 'examples', label: 'Examples', level: 2 as const },
      ...doc.examples.map(example => ({ id: `example-${example.name}`, label: example.title, level: 3 as const })),
      ...(doc.symbols.length > 0 ? [{ id: 'api', label: 'API', level: 2 as const }] : []),
      ...doc.symbols.map(symbol => ({ id: `api-${symbol.name}`, label: symbol.name, level: 3 as const })),
      { id: 'source', label: 'Source', level: 2 as const }
    ];
  });
}
