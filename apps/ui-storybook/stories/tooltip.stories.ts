import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';
import { XuiTooltip, XuiTooltipImports } from '@xui/tooltip';

/**
 * A hint that floats over an element on hover or focus. A thin preset over the
 * same `@xui/core/overlay` foundation as the popover — non-interactive, opens on
 * focus for keyboard users, and describes its trigger via `aria-describedby`.
 *
 * Hover, focus and positioning cannot be exercised in jsdom, so these stories
 * are where that behaviour is verified.
 */
const meta: Meta<XuiTooltip> = {
  title: 'Overlays/Tooltip',
  component: XuiTooltip,
  decorators: [moduleMetadata({ imports: [XuiTooltipImports, XuiButtonImports] })]
};

export default meta;
type Story = StoryObj<XuiTooltip>;

/** Hover or tab to the button. */
export const Default: Story = {
  render: () => ({
    template: `<button xuiButton [xuiTooltip]="'Saves without leaving the page'">Save draft</button>`
  })
};

/** One tooltip per color, so the colour treatment reads at a glance. */
export const Colors: Story = {
  render: () => ({
    props: { colors: ['none', 'primary', 'success', 'error', 'warning', 'info'] },
    template: `
      <div class="flex flex-wrap gap-3 p-12">
        @for (color of colors; track color) {
          <button xuiButton variant="outline" [xuiTooltip]="color + ' hint'" [color]="color">{{ color }}</button>
        }
      </div>
    `
  })
};

/** Compact trims the padding for dense toolbars. */
export const Compact: Story = {
  render: () => ({
    template: `<button xuiButton [xuiTooltip]="'Undo'" compact>Undo</button>`
  })
};

/** Every placement around one anchor. Hover each to see where it lands. */
export const Placements: Story = {
  render: () => ({
    props: {
      placements: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end'
      ]
    },
    template: `
      <div class="grid grid-cols-3 gap-3 p-24">
        @for (p of placements; track p) {
          <button xuiButton size="sm" variant="outline" [xuiTooltip]="p" [placement]="p">{{ p }}</button>
        }
      </div>
    `
  })
};

/** Rich content through a template rather than a plain string. */
export const TemplateContent: Story = {
  render: () => ({
    template: `
      <button xuiButton [xuiTooltip]="rich">Shortcuts</button>
      <ng-template #rich>
        <div class="flex flex-col gap-1">
          <span>Save <kbd class="bg-background/20 rounded px-1">⌘S</kbd></span>
          <span>Undo <kbd class="bg-background/20 rounded px-1">⌘Z</kbd></span>
        </div>
      </ng-template>
    `
  })
};
