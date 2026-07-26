import { signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiBreadcrumbImports } from '@xui/breadcrumb';
import { XuiLinkImports } from '@xui/link';
import { XuiOverflowList, XuiOverflowListImports } from '@xui/overflow-list';
import { XuiTagImports } from '@xui/tag';

const CRUMBS = ['Home', 'Projects', 'Rikarin', 'xui', 'libs', 'ui', 'overflow-list'];

const meta: Meta<XuiOverflowList<string>> = {
  title: 'Layout/Overflow list',
  component: XuiOverflowList,
  decorators: [
    moduleMetadata({ imports: [XuiOverflowListImports, XuiLinkImports, XuiTagImports, XuiBreadcrumbImports] })
  ]
};

export default meta;
type Story = StoryObj<XuiOverflowList<string>>;

/** Drag the container narrower to watch items collapse into the overflow slot. */
export const Default: Story = {
  render: () => ({
    props: { items: signal(CRUMBS) },
    template: `
      <div class="border-border resize-x overflow-auto rounded border p-3" style="width: 32rem">
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
};

/** Collapsing from the end keeps the leading items — right for a tab bar. */
export const CollapseFromEnd: Story = {
  render: () => ({
    props: { items: signal(CRUMBS) },
    template: `
      <div class="border-border resize-x overflow-auto rounded border p-3" style="width: 24rem">
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
};

/** The breadcrumb parts composed by hand. `<xui-breadcrumbs>` does this for you. */
export const CollapsingBreadcrumbs: Story = {
  render: () => ({
    props: { items: signal(CRUMBS) },
    template: `
      <nav xuiBreadcrumb class="border-border resize-x overflow-auto rounded border p-3" style="width: 28rem">
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
};
