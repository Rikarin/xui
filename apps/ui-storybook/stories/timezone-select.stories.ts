import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiTimezoneSelect, XuiTimezoneSelectImports } from '@xui/timezone-select';

/**
 * A searchable time-zone picker: the runtime's IANA zones (via
 * `Intl.supportedValuesOf('timeZone')`) fed into `xui-select`, each labelled with its
 * current GMT offset. The value is the selected IANA id (a string), bound with
 * `[(value)]` or a form control.
 */
const meta: Meta<XuiTimezoneSelect> = {
  title: 'Date & time/Timezone select',
  component: XuiTimezoneSelect,
  decorators: [
    moduleMetadata({
      imports: [XuiTimezoneSelectImports, ReactiveFormsModule]
    })
  ]
};

export default meta;
type Story = StoryObj<XuiTimezoneSelect>;

export const Default: Story = {
  render: () => ({
    template: `
      <div class="w-72">
        <xui-timezone-select />
      </div>
    `
  })
};

/** `[(value)]` holds the IANA id — `'Europe/Berlin'`, not the display label. */
export const TwoWayBinding: Story = {
  render: () => ({
    props: { zone: 'Europe/Berlin' },
    template: `
      <div class="w-72">
        <xui-timezone-select [(value)]="zone" />
        <p class="text-foreground-muted mt-3 text-sm">Zone: {{ zone ?? '—' }}</p>
      </div>
    `
  })
};

/** A `ControlValueAccessor`, so `formControl` binds the IANA id directly. */
export const ReactiveForm: Story = {
  render: () => ({
    props: {
      zone: new FormControl<string | null>('Asia/Tokyo')
    },
    template: `
      <div class="w-72">
        <xui-timezone-select [formControl]="zone" />
        <p class="text-foreground-muted mt-3 text-sm">Form value: {{ zone.value ?? '—' }}</p>
      </div>
    `
  })
};

export const Disabled: Story = {
  render: () => ({
    props: { zone: 'UTC' },
    template: `
      <div class="w-72">
        <xui-timezone-select disabled [(value)]="zone" />
      </div>
    `
  })
};
