import { RouterTestingModule } from '@angular/router/testing';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matHomeRound } from '@ng-icons/material-icons/round';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { XuiBreadcrumb, XuiBreadcrumbImports } from '@xui/breadcrumb';
import { XuiIconDirective } from '@xui/icon';

export default {
  title: 'Breadcrumb',
  component: XuiBreadcrumb,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiBreadcrumbImports, NgIcon, XuiIconDirective, RouterTestingModule],
      providers: [provideIcons({ matHomeRound })]
    })
  ]
} as Meta<XuiBreadcrumb>;

type Story = StoryObj<XuiBreadcrumb>;

export const Default: Story = {
  render: () => ({
    template: `
			<nav xuiBreadcrumb>
				<ol xuiBreadcrumbList>
					<li xuiBreadcrumbItem>
						<a xuiBreadcrumbLink href="/home">
              <ng-icon xui size="md" name="matHomeRound" />
						</a>
					</li>
					<li xuiBreadcrumbSeparator></li>
					<li xuiBreadcrumbItem>
						<xui-breadcrumb-ellipsis />
					</li>
					<li xuiBreadcrumbSeparator></li>
					<li xuiBreadcrumbItem>
						<a xuiBreadcrumbLink href="/components">Components</a>
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
