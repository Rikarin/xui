import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiHtmlSelect, XuiHtmlSelectImports } from '@xui/html-select';

/**
 * A styled native `<select>` — the platform dropdown, keyboard and mobile
 * behaviour kept, only framed with a chevron. Options as data or projected
 * `<option>` elements. Full `ControlValueAccessor`.
 */
const meta: Meta<XuiHtmlSelect> = {
  title: 'Forms/HTML select',
  component: XuiHtmlSelect,
  decorators: [moduleMetadata({ imports: [XuiHtmlSelectImports, FormsModule] })],
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } }
};

export default meta;
type Story = StoryObj<XuiHtmlSelect>;

export const Default: Story = {
  render: () => ({
    props: {
      sort: 'newest',
      options: [
        { value: 'newest', label: 'Newest first' },
        { value: 'oldest', label: 'Oldest first' },
        { value: 'az', label: 'A → Z' }
      ]
    },
    template: `
      <xui-html-select class="w-56" [options]="options" [(ngModel)]="sort" aria-label="Sort" />
      <p class="text-foreground-muted mt-3 text-sm">Sort: {{ sort }}</p>
    `
  })
};

export const WithPlaceholder: Story = {
  render: () => ({
    props: {
      options: [
        { value: 'dev', label: 'Development' },
        { value: 'prod', label: 'Production' }
      ]
    },
    template: `<xui-html-select class="w-56" placeholder="Choose an environment" [options]="options" aria-label="Environment" />`
  })
};

/** Projected `<option>` elements instead of the data API. */
export const Projected: Story = {
  render: () => ({
    template: `
      <xui-html-select class="w-56" aria-label="Country">
        <option value="us">United States</option>
        <option value="cz">Czechia</option>
        <option value="jp">Japan</option>
      </xui-html-select>
    `
  })
};

export const Small: Story = {
  render: () => ({
    props: {
      options: [
        { value: '10', label: '10 / page' },
        { value: '25', label: '25 / page' }
      ]
    },
    template: `<xui-html-select class="w-40" size="sm" [options]="options" value="25" aria-label="Per page" />`
  })
};
