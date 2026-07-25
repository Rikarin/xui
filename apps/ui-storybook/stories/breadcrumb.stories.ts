import { provideRouter } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matFolderRound, matHomeRound } from '@ng-icons/material-icons/round';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiBreadcrumbImports, XuiBreadcrumbs, type XuiBreadcrumbData } from '@xui/breadcrumb';
import { XuiIcon } from '@xui/icon';

const TRAIL: XuiBreadcrumbData[] = [
  { text: 'Home', href: '#' },
  { text: 'Projects', href: '#' },
  { text: 'Rikarin', href: '#' },
  { text: 'xui', href: '#' },
  { text: 'libs', href: '#' },
  { text: 'ui', href: '#' },
  { text: 'breadcrumb' }
];

const meta: Meta<XuiBreadcrumbs> = {
  title: 'Breadcrumb',
  component: XuiBreadcrumbs,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiBreadcrumbImports, NgIcon, XuiIcon],
      providers: [provideIcons({ matHomeRound, matFolderRound })]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiBreadcrumbs>;

/** The trail as data. Crumbs that do not fit fold into the ellipsis. */
export const Default: Story = {
  args: { items: TRAIL }
};

/** Drag the container narrower to watch the leading crumbs collapse. */
export const Collapsing: Story = {
  render: () => ({
    props: { items: TRAIL },
    template: `
      <div class="border-border resize-x overflow-auto rounded border p-3" style="width: 30rem">
        <xui-breadcrumbs [items]="items" [minVisibleItems]="1" />
      </div>
    `
  })
};

/** Collapsing from the end keeps where you started rather than where you are. */
export const CollapseFromEnd: Story = {
  render: () => ({
    props: { items: TRAIL },
    template: `
      <div class="border-border resize-x overflow-auto rounded border p-3" style="width: 24rem">
        <xui-breadcrumbs [items]="items" collapseFrom="end" [minVisibleItems]="1" />
      </div>
    `
  })
};

/** An `icon` names an icon the application has registered with `provideIcons`. */
export const WithIcons: Story = {
  args: {
    items: [
      { text: 'Home', href: '#', icon: 'matHomeRound' },
      { text: 'Projects', href: '#', icon: 'matFolderRound' },
      { text: 'xui' }
    ]
  }
};

/** A crumb kept in the trail but made unreachable. */
export const Disabled: Story = {
  args: {
    items: [{ text: 'Home', href: '#' }, { text: 'Archived', href: '#', disabled: true }, { text: 'Report' }]
  }
};

/** `xuiBreadcrumbsCurrent` takes over the last crumb without touching the rest. */
export const CustomCurrentCrumb: Story = {
  render: () => ({
    props: { items: TRAIL.slice(0, 4) },
    template: `
      <xui-breadcrumbs [items]="items">
        <ng-template xuiBreadcrumbsCurrent let-item>
          <span class="text-primary-emphasis inline-flex items-center gap-1.5 font-semibold">
            <ng-icon xui size="sm" name="matFolderRound" />
            {{ item.text }}
          </span>
        </ng-template>
      </xui-breadcrumbs>
    `
  })
};

/**
 * Router navigation. Only an item with `link` needs a router — the link part no
 * longer composes `RouterLink`, so a plain trail renders without one.
 */
export const Routed: Story = {
  // A catch-all keeps the router from complaining about Storybook's own URL.
  decorators: [applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }])] })],
  args: {
    items: [{ text: 'Home', link: ['/'] }, { text: 'Docs', link: ['/docs'] }, { text: 'Breadcrumb' }]
  }
};

/** The parts, composed by hand, for when the markup has to differ. */
export const Composed: Story = {
  render: () => ({
    template: `
      <nav xuiBreadcrumb>
        <ol xuiBreadcrumbList>
          <li xuiBreadcrumbItem>
            <!-- The icon is decorative (aria-hidden), so an icon-only link has
                 to carry the name itself. -->
            <a xuiBreadcrumbLink href="#" aria-label="Home"><ng-icon xui size="md" name="matHomeRound" /></a>
          </li>
          <li xuiBreadcrumbSeparator></li>
          <li xuiBreadcrumbItem><xui-breadcrumb-ellipsis /></li>
          <li xuiBreadcrumbSeparator></li>
          <li xuiBreadcrumbItem>
            <a xuiBreadcrumbLink href="#">Components</a>
          </li>
          <li xuiBreadcrumbSeparator></li>
          <li xuiBreadcrumbItem active>
            <span xuiBreadcrumbPage>Breadcrumb</span>
          </li>
        </ol>
      </nav>
    `
  })
};
