import { RouterTestingModule } from '@angular/router/testing';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matHomeRound } from '@ng-icons/material-icons/round';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { XuiIconDirective } from '../icon/xui/src';
import { XuiBreadcrumbDirective, XuiBreadcrumbImports } from './xui/src';

export default {
  title: 'Breadcrumb',
  component: XuiBreadcrumbDirective,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [XuiBreadcrumbImports, NgIcon, XuiIconDirective, RouterTestingModule],
      providers: [provideIcons({ matHomeRound })]
    })
  ]
} as Meta<XuiBreadcrumbDirective>;

type Story = StoryObj<XuiBreadcrumbDirective>;

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
