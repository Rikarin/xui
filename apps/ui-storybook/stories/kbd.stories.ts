import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiKbd, XuiKbdImports } from '@xui/kbd';

/**
 * A keyboard-key cap. Put `xuiKbd` on a `<kbd>` and chain several to spell a
 * shortcut — the natural label for a `@xui/hotkeys` binding.
 */
const meta: Meta<XuiKbd> = {
  title: 'Data display/Kbd',
  component: XuiKbd,
  decorators: [moduleMetadata({ imports: [XuiKbdImports] })]
};

export default meta;
type Story = StoryObj<XuiKbd>;

export const Basic: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-1">
        <kbd xuiKbd>⌘</kbd>
        <kbd xuiKbd>K</kbd>
      </div>
    `
  })
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1"><kbd xuiKbd size="sm">⌥</kbd><kbd xuiKbd size="sm">S</kbd></div>
        <div class="flex items-center gap-1"><kbd xuiKbd size="md">⌘</kbd><kbd xuiKbd size="md">K</kbd></div>
        <div class="flex items-center gap-1"><kbd xuiKbd size="lg">⇧</kbd><kbd xuiKbd size="lg">Enter</kbd></div>
      </div>
    `
  })
};

/** Inline in prose, e.g. describing a shortcut. */
export const InSentence: Story = {
  render: () => ({
    template: `
      <p class="text-foreground text-sm">
        Press <kbd xuiKbd>Ctrl</kbd> <kbd xuiKbd>Shift</kbd> <kbd xuiKbd>P</kbd> to open the command palette.
      </p>
    `
  })
};
