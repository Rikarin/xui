import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiCardImports } from '@xui/card';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { COMPONENTS, GROUPS } from '../../generated/manifest';
import { HeadingAnchor } from '../shared/heading-anchor';

@Component({
  selector: 'docs-components-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, XuiCardImports, XuiTagImports, XuiTextImports, HeadingAnchor],
  template: `
    <article class="max-w-4xl">
      <h1 xuiHeading [level]="1">Components</h1>
      <p xuiText color="muted" size="lg" class="mt-3 mb-10 max-w-2xl">
        {{ total }} packages. Every page is generated from the library sources, so the selectors, inputs and variant
        axes listed are the ones the code actually has.
      </p>

      @for (group of groups; track group.name) {
        <section class="mb-12">
          <h2 xuiHeading [level]="2" class="mb-1" [docsAnchor]="group.anchor">{{ group.name }}</h2>
          <p xuiText color="subtle" size="sm" class="mb-4">{{ group.items.length }} packages</p>

          <div class="grid gap-3 sm:grid-cols-2">
            @for (component of group.items; track component.slug) {
              <a
                xuiCard
                interactive
                compact
                class="block no-underline"
                [routerLink]="['/docs/components', component.slug]"
              >
                <div class="mb-1 flex items-center gap-2">
                  <span xuiText weight="medium">{{ component.title }}</span>
                  @if (component.kind === 'core') {
                    <xui-tag minimal>headless</xui-tag>
                  }
                </div>
                <code xuiCode class="text-xs">{{ component.package }}</code>
              </a>
            }
          </div>
        </section>
      }
    </article>
  `
})
export class ComponentsIndex {
  protected readonly total = COMPONENTS.length;

  protected readonly groups = GROUPS.map(name => ({
    name,
    anchor: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    items: COMPONENTS.filter(component => component.group === name)
  })).filter(group => group.items.length > 0);
}
