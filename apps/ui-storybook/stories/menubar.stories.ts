import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiMenuImports } from '@xui/menu';
import { XuiMenubar, XuiMenubarImports } from '@xui/menubar';

/**
 * A desktop-style application menu bar. Built on the Angular CDK's `CdkMenuBar`:
 * roving focus, arrow keys move between menus, and once one is open, hovering a
 * sibling switches to it. Dropdowns are `@xui/menu`.
 */
const meta: Meta<XuiMenubar> = {
  title: 'Navigation/Menubar',
  component: XuiMenubar,
  decorators: [moduleMetadata({ imports: [XuiMenubarImports, XuiMenuImports] })]
};

export default meta;
type Story = StoryObj<XuiMenubar>;

export const Basic: Story = {
  render: () => ({
    template: `
      <div xuiMenubar>
        <button xuiMenubarTrigger [xuiMenubarTriggerFor]="file">File</button>
        <button xuiMenubarTrigger [xuiMenubarTriggerFor]="edit">Edit</button>
        <button xuiMenubarTrigger [xuiMenubarTriggerFor]="view">View</button>
      </div>

      <ng-template #file>
        <xui-menu>
          <button xuiMenuItem>New Tab<span menuItemLabel>⌘T</span></button>
          <button xuiMenuItem>New Window<span menuItemLabel>⌘N</span></button>
          <xui-menu-divider />
          <button xuiMenuItem>Print…<span menuItemLabel>⌘P</span></button>
        </xui-menu>
      </ng-template>
      <ng-template #edit>
        <xui-menu>
          <button xuiMenuItem>Undo<span menuItemLabel>⌘Z</span></button>
          <button xuiMenuItem>Redo<span menuItemLabel>⇧⌘Z</span></button>
          <xui-menu-divider />
          <button xuiMenuItem [xuiMenuTriggerFor]="find">Find…</button>
        </xui-menu>
      </ng-template>
      <ng-template #find>
        <xui-menu>
          <button xuiMenuItem>Search the Web</button>
          <button xuiMenuItem>Find…<span menuItemLabel>⌘F</span></button>
          <button xuiMenuItem>Find Next<span menuItemLabel>⌘G</span></button>
        </xui-menu>
      </ng-template>
      <ng-template #view>
        <xui-menu>
          <xui-menu-divider title="Appearance" />
          <button xuiMenuItem selected>Show Toolbar</button>
          <button xuiMenuItem>Show Sidebar</button>
          <xui-menu-divider />
          <button xuiMenuItem>Reload<span menuItemLabel>⌘R</span></button>
        </xui-menu>
      </ng-template>
    `
  })
};
