import { provideIcons } from '@ng-icons/core';
import {
  matContentCopyRound,
  matDeleteRound,
  matDriveFileRenameOutlineRound,
  matGridViewRound,
  matViewListRound
} from '@ng-icons/material-icons/round';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiMenu, XuiMenuImports } from '@xui/menu';

/**
 * A list of commands, opened from a trigger. Built on the Angular CDK's menu
 * primitives, so arrow-key navigation, typeahead, submenu aim, Escape and
 * close-on-select all work — none of which jsdom exercises, so these stories
 * are the real check.
 */
const meta: Meta<XuiMenu> = {
  title: 'Overlays/Menu',
  component: XuiMenu,
  decorators: [
    moduleMetadata({
      imports: [XuiMenuImports, XuiButtonImports],
      providers: [
        provideIcons({
          matDriveFileRenameOutlineRound,
          matContentCopyRound,
          matDeleteRound,
          matGridViewRound,
          matViewListRound
        })
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiMenu>;

/** Click the button, then drive it with the arrow keys and type-ahead. */
export const Default: Story = {
  render: () => ({
    template: `
      <button xuiButton [xuiMenuTriggerFor]="menu">File actions</button>
      <ng-template #menu>
        <xui-menu>
          <button xuiMenuItem icon="matDriveFileRenameOutlineRound">Rename<span menuItemLabel>⌘R</span></button>
          <button xuiMenuItem icon="matContentCopyRound">Duplicate<span menuItemLabel>⌘D</span></button>
          <xui-menu-divider />
          <button xuiMenuItem icon="matDeleteRound" intent="error">Delete<span menuItemLabel>⌫</span></button>
        </xui-menu>
      </ng-template>
    `
  })
};

/** A checkmark marks the chosen option; the left cell keeps labels aligned. */
export const Selection: Story = {
  render: () => ({
    template: `
      <button xuiButton [xuiMenuTriggerFor]="menu">View</button>
      <ng-template #menu>
        <xui-menu>
          <xui-menu-divider title="Layout" />
          <button xuiMenuItem selected>Grid</button>
          <button xuiMenuItem>List</button>
          <xui-menu-divider title="Sort" />
          <button xuiMenuItem>Name</button>
          <button xuiMenuItem selected>Modified</button>
        </xui-menu>
      </ng-template>
    `
  })
};

/** A submenu: hover or arrow into "Copy to" — cdk/menu handles the aim and nesting. */
export const Submenu: Story = {
  render: () => ({
    template: `
      <button xuiButton [xuiMenuTriggerFor]="menu">Organise</button>
      <ng-template #menu>
        <xui-menu>
          <button xuiMenuItem icon="matDriveFileRenameOutlineRound">Rename</button>
          <button xuiMenuItem [xuiMenuTriggerFor]="copyTo">Copy to…</button>
          <xui-menu-divider />
          <button xuiMenuItem intent="error" icon="matDeleteRound">Delete</button>
        </xui-menu>
      </ng-template>
      <ng-template #copyTo>
        <xui-menu>
          <button xuiMenuItem>Documents</button>
          <button xuiMenuItem>Pictures</button>
          <button xuiMenuItem [xuiMenuTriggerFor]="projects">Projects</button>
        </xui-menu>
      </ng-template>
      <ng-template #projects>
        <xui-menu>
          <button xuiMenuItem>storefront</button>
          <button xuiMenuItem>warehouse</button>
        </xui-menu>
      </ng-template>
    `
  })
};

/** A disabled command stays visible but cannot be chosen or focused into activation. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <button xuiButton [xuiMenuTriggerFor]="menu">Edit</button>
      <ng-template #menu>
        <xui-menu>
          <button xuiMenuItem>Undo</button>
          <button xuiMenuItem disabled>Redo</button>
          <button xuiMenuItem disabled>Paste</button>
        </xui-menu>
      </ng-template>
    `
  })
};
