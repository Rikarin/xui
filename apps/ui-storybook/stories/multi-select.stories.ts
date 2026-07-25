import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiMultiSelect, XuiMultiSelectImports } from '@xui/multi-select';

interface Framework {
  id: number;
  name: string;
}

const FRAMEWORKS: Framework[] = [
  { id: 1, name: 'Angular' },
  { id: 2, name: 'React' },
  { id: 3, name: 'Vue' },
  { id: 4, name: 'Svelte' },
  { id: 5, name: 'Solid' },
  { id: 6, name: 'Qwik' }
];

/**
 * A filterable multi-select: removable chips + a query input open a popover of
 * options with a check on the chosen ones. Clicking an option toggles it and the
 * popover stays open; Backspace on an empty query removes the last chip.
 * `[(selectedItems)]` two-way binding.
 */
const meta: Meta<XuiMultiSelect<Framework>> = {
  title: 'Forms/Multi-select',
  component: XuiMultiSelect,
  decorators: [moduleMetadata({ imports: [XuiMultiSelectImports] })]
};

export default meta;
type Story = StoryObj<XuiMultiSelect<Framework>>;

export const Default: Story = {
  render: () => ({
    props: {
      items: FRAMEWORKS,
      itemText: (f: Framework) => f.name,
      selected: [FRAMEWORKS[0]] as Framework[]
    },
    template: `
      <div class="w-80">
        <xui-multi-select [items]="items" [itemText]="itemText" [(selectedItems)]="selected" placeholder="Add frameworks…" />
        <p class="text-foreground-muted mt-3 text-sm">Selected: {{ selected.length ? selected.map(f => f.name).join(', ') : '—' }}</p>
      </div>
    `
  })
};
