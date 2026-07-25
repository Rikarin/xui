import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiButtonGroup, XuiButtonGroupImports } from '@xui/button-group';
import { XuiMenuImports } from '@xui/menu';

/**
 * A row of buttons that read as one control. The group squares off the inner corners and
 * collapses the shared borders, so the segments meet cleanly at any size.
 */
const meta: Meta<XuiButtonGroup> = {
  title: 'Actions/Button group',
  component: XuiButtonGroup,
  decorators: [
    moduleMetadata({
      imports: [XuiButtonGroupImports, XuiButtonImports, XuiMenuImports]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiButtonGroup>;

export const Default: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup>
      <button xuiButton>Foo</button>
      <button xuiButton>Bar</button>
      <button xuiButton>Lorem</button>
    </div>
    `
  })
};

export const OutlineButtons: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup>
      <button xuiButton variant="outline">Foo</button>
      <button xuiButton variant="outline">Bar</button>
      <button xuiButton variant="outline">Lorem</button>
    </div>
    `
  })
};

/** Stacked vertically, with the radii collapsing on the vertical axis. */
export const Vertical: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup vertical class="w-40">
      <button xuiButton variant="outline">Top</button>
      <button xuiButton variant="outline">Middle</button>
      <button xuiButton variant="outline">Bottom</button>
    </div>
    `
  })
};

/** `fill` shares the width equally; `alignText` positions each label. */
export const Fill: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup fill alignText="left" class="w-96">
      <button xuiButton variant="outline">Files</button>
      <button xuiButton variant="outline">Settings</button>
      <button xuiButton variant="outline">Help</button>
    </div>
    `
  })
};

/**
 * A menu-bar pattern: each button in the group opens its own menu. A leading
 * glyph names the command and a trailing caret hints at the dropdown — the caret
 * points down on a horizontal bar and right when stacked vertically.
 */
export const MenuTriggers: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup class="min-w-32">
      <button xuiButton variant="outline" [xuiMenuTriggerFor]="file">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        File
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button xuiButton variant="outline" [xuiMenuTriggerFor]="edit">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Edit
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button xuiButton variant="outline" [xuiMenuTriggerFor]="view">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
        View
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <ng-template #file>
      <xui-menu>
        <button xuiMenuItem>New<span menuItemLabel>⌘N</span></button>
        <button xuiMenuItem>Open…<span menuItemLabel>⌘O</span></button>
        <xui-menu-divider />
        <button xuiMenuItem>Save<span menuItemLabel>⌘S</span></button>
      </xui-menu>
    </ng-template>
    <ng-template #edit>
      <xui-menu>
        <button xuiMenuItem>Undo<span menuItemLabel>⌘Z</span></button>
        <button xuiMenuItem>Redo<span menuItemLabel>⇧⌘Z</span></button>
        <xui-menu-divider />
        <button xuiMenuItem>Cut</button>
        <button xuiMenuItem>Copy</button>
        <button xuiMenuItem>Paste</button>
      </xui-menu>
    </ng-template>
    <ng-template #view>
      <xui-menu>
        <xui-menu-divider title="Appearance" />
        <button xuiMenuItem selected>Grid</button>
        <button xuiMenuItem>List</button>
      </xui-menu>
    </ng-template>
    `
  })
};

/**
 * The same menu-bar stacked vertically — the trailing caret points right, and
 * each menu opens beside its trigger.
 */
export const VerticalMenuTriggers: Story = {
  render: () => ({
    template: `
    <div xuiButtonGroup vertical alignText="left" class="w-40">
      <button xuiButton variant="outline" [xuiMenuTriggerFor]="file">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        File
        <svg viewBox="0 0 24 24" class="ml-auto h-4 w-4" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button xuiButton variant="outline" [xuiMenuTriggerFor]="edit">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Edit
        <svg viewBox="0 0 24 24" class="ml-auto h-4 w-4" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button xuiButton variant="outline" [xuiMenuTriggerFor]="view">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
        View
        <svg viewBox="0 0 24 24" class="ml-auto h-4 w-4" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <ng-template #file>
      <xui-menu>
        <button xuiMenuItem>New<span menuItemLabel>⌘N</span></button>
        <button xuiMenuItem>Open…<span menuItemLabel>⌘O</span></button>
        <xui-menu-divider />
        <button xuiMenuItem>Save<span menuItemLabel>⌘S</span></button>
      </xui-menu>
    </ng-template>
    <ng-template #edit>
      <xui-menu>
        <button xuiMenuItem>Undo<span menuItemLabel>⌘Z</span></button>
        <button xuiMenuItem>Redo<span menuItemLabel>⇧⌘Z</span></button>
        <xui-menu-divider />
        <button xuiMenuItem>Cut</button>
        <button xuiMenuItem>Copy</button>
        <button xuiMenuItem>Paste</button>
      </xui-menu>
    </ng-template>
    <ng-template #view>
      <xui-menu>
        <xui-menu-divider title="Appearance" />
        <button xuiMenuItem selected>Grid</button>
        <button xuiMenuItem>List</button>
      </xui-menu>
    </ng-template>
    `
  })
};
