import { provideIcons } from '@ng-icons/core';
import { matContentCopyRound, matContentCutRound, matContentPasteRound } from '@ng-icons/material-icons/round';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiContextMenuImports, XuiContextMenuTrigger } from '@xui/context-menu';
import { XuiMenuImports } from '@xui/menu';

/**
 * Opens the same `@xui/menu` panel where the user right-clicks. Built on
 * `CdkContextMenuTrigger`, so it shares the menu's keyboard model, submenu aim
 * and dismissal — only the way it opens differs. Right-click is not something
 * jsdom exercises, so this story is the real check.
 */
const meta: Meta<XuiContextMenuTrigger> = {
  title: 'Overlays/Context menu',
  component: XuiContextMenuTrigger,
  decorators: [
    moduleMetadata({
      imports: [XuiContextMenuImports, XuiMenuImports],
      providers: [provideIcons({ matContentCutRound, matContentCopyRound, matContentPasteRound })]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiContextMenuTrigger>;

/** Right-click inside the zone. */
export const Default: Story = {
  render: () => ({
    template: `
      <div
        [xuiContextMenuTriggerFor]="menu"
        class="border-border text-foreground-muted grid h-48 w-96 place-items-center rounded-lg border border-dashed text-sm select-none"
      >
        Right-click anywhere in here
      </div>
      <ng-template #menu>
        <xui-menu>
          <button xuiMenuItem icon="matContentCutRound">Cut<span menuItemLabel>⌘X</span></button>
          <button xuiMenuItem icon="matContentCopyRound">Copy<span menuItemLabel>⌘C</span></button>
          <button xuiMenuItem icon="matContentPasteRound">Paste<span menuItemLabel>⌘V</span></button>
          <xui-menu-divider />
          <button xuiMenuItem [xuiMenuTriggerFor]="more">More</button>
        </xui-menu>
      </ng-template>
      <ng-template #more>
        <xui-menu>
          <button xuiMenuItem>Select all</button>
          <button xuiMenuItem intent="error">Delete</button>
        </xui-menu>
      </ng-template>
    `
  })
};
