import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiRadioGroup, XuiRadioImports } from '@xui/radio';

/**
 * A single-choice group. The group owns the value, the shared name and a single
 * tab stop — arrow keys move between options per the WAI-ARIA radio pattern.
 * Bind forms to the group, never to individual radios.
 */
const meta: Meta<XuiRadioGroup> = {
  title: 'Forms/Radio',
  component: XuiRadioGroup,
  decorators: [moduleMetadata({ imports: [XuiRadioImports, FormsModule] })]
};

export default meta;
type Story = StoryObj<XuiRadioGroup>;

/** Click an option or tab in and use the arrow keys. */
export const Default: Story = {
  render: () => ({
    props: { plan: 'free' },
    template: `
      <xui-radio-group [(value)]="plan" aria-label="Plan">
        <label class="flex items-center gap-2 text-sm"><xui-radio value="free" /> Free</label>
        <label class="flex items-center gap-2 text-sm"><xui-radio value="pro" /> Pro</label>
        <label class="flex items-center gap-2 text-sm"><xui-radio value="team" /> Team</label>
      </xui-radio-group>
      <p class="text-foreground-muted mt-3 text-sm">Selected: {{ plan }}</p>
    `
  })
};

/** Horizontal layout with a disabled option. */
export const Horizontal: Story = {
  render: () => ({
    props: { size: 'md' },
    template: `
      <xui-radio-group [(value)]="size" orientation="horizontal" aria-label="Size">
        <label class="flex items-center gap-2 text-sm"><xui-radio value="sm" /> Small</label>
        <label class="flex items-center gap-2 text-sm"><xui-radio value="md" /> Medium</label>
        <label class="flex items-center gap-2 text-sm"><xui-radio value="lg" /> Large</label>
        <label class="flex items-center gap-2 text-sm opacity-60"><xui-radio value="xl" disabled /> XL (soon)</label>
      </xui-radio-group>
    `
  })
};

/** A whole group disabled. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <xui-radio-group value="a" disabled aria-label="Disabled group">
        <label class="flex items-center gap-2 text-sm"><xui-radio value="a" /> One</label>
        <label class="flex items-center gap-2 text-sm"><xui-radio value="b" /> Two</label>
      </xui-radio-group>
    `
  })
};
