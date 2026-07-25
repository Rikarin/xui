import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiSuggest, XuiSuggestImports } from '@xui/suggest';

const CITIES = [
  'Amsterdam',
  'Berlin',
  'Copenhagen',
  'Lisbon',
  'Madrid',
  'Prague',
  'Stockholm',
  'Vienna',
  'Warsaw'
];

/**
 * A typeahead autocomplete: the text input itself is the target. Typing filters a
 * popover list; choosing an item fills the input. Arrow/Enter/Escape keyboard.
 * `[(selectedItem)]` two-way binding.
 */
const meta: Meta<XuiSuggest<string>> = {
  title: 'Forms/Suggest',
  component: XuiSuggest,
  decorators: [moduleMetadata({ imports: [XuiSuggestImports] })]
};

export default meta;
type Story = StoryObj<XuiSuggest<string>>;

export const Default: Story = {
  render: () => ({
    props: { cities: CITIES, selected: null as string | null },
    template: `
      <div class="w-64">
        <xui-suggest [items]="cities" [(selectedItem)]="selected" placeholder="Search a city…" />
        <p class="text-foreground-muted mt-3 text-sm">Selected: {{ selected ?? '—' }}</p>
      </div>
    `
  })
};
