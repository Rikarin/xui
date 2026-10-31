import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { XuiBreadcrumbImports } from '@xui/breadcrumb';
import { XuiLinkImports } from '@xui/link';
import { XuiOverflowListImports } from '@xui/overflow-list';
import { XuiTagImports } from '@xui/tag';

/**
 * Every one of these hands its items to an `ng-template` through a context variable, which the
 * template type-checker types as `unknown` with no way to widen it from a generated file. Written
 * out here, where the component owns the list and the templates are type-checked against it.
 *
 * Mirrors `apps/ui-storybook/stories/overflow-list.stories.ts`; keep the two in step.
 */
const CRUMBS = ['Home', 'Projects', 'Rikarin', 'xui', 'libs', 'ui', 'overflow-list'];

@Component({
  selector: 'docs-overflow-list-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiOverflowListImports, XuiLinkImports, XuiTagImports],
  template: `
    <div class="border-border w-128 max-w-full resize-x overflow-auto rounded border p-3">
      <xui-overflow-list [items]="items()">
        <ng-template xuiOverflowListItem let-item>
          <a xuiLink color="inherit" underline="hover" href="#" class="whitespace-nowrap">{{ item }}</a>
        </ng-template>
        <ng-template xuiOverflowListOverflow let-count="count">
          <xui-tag minimal>+{{ count }}</xui-tag>
        </ng-template>
      </xui-overflow-list>
    </div>
  `
})
export class PreviewDefault {
  protected readonly items = signal(CRUMBS);
}

@Component({
  selector: 'docs-overflow-list-end-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiOverflowListImports, XuiLinkImports, XuiTagImports],
  template: `
    <div class="border-border w-96 max-w-full resize-x overflow-auto rounded border p-3">
      <xui-overflow-list [items]="items()" collapseFrom="end">
        <ng-template xuiOverflowListItem let-item>
          <a xuiLink color="inherit" underline="hover" href="#" class="whitespace-nowrap">{{ item }}</a>
        </ng-template>
        <ng-template xuiOverflowListOverflow let-count="count">
          <xui-tag minimal>+{{ count }}</xui-tag>
        </ng-template>
      </xui-overflow-list>
    </div>
  `
})
export class PreviewCollapseFromEnd {
  protected readonly items = signal(CRUMBS);
}

@Component({
  selector: 'docs-overflow-list-breadcrumbs-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiOverflowListImports, XuiBreadcrumbImports],
  template: `
    <nav xuiBreadcrumb class="border-border w-112 max-w-full resize-x overflow-auto rounded border p-3">
      <xui-overflow-list [items]="items()" [minVisibleItems]="1">
        <ng-template xuiOverflowListItem let-item let-index="index">
          <span xuiBreadcrumbItem class="whitespace-nowrap">
            @if (index > 0) {
              <span xuiBreadcrumbSeparator class="mr-1.5"></span>
            }
            @if (index === items().length - 1) {
              <span xuiBreadcrumbPage>{{ item }}</span>
            } @else {
              <a xuiBreadcrumbLink href="#">{{ item }}</a>
            }
          </span>
        </ng-template>
        <ng-template xuiOverflowListOverflow>
          <xui-breadcrumb-ellipsis />
        </ng-template>
      </xui-overflow-list>
    </nav>
  `
})
export class PreviewCollapsingBreadcrumbs {
  protected readonly items = signal(CRUMBS);
}
