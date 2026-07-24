import { FormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiTextarea, XuiTextareaImports } from '@xui/textarea';

/**
 * A styled native `<textarea>`. `ngModel`/`formControl`, validation and the
 * invalid-and-touched error styling all come from Angular's own textarea
 * support — the directive only dresses it and, with `autoResize`, grows it.
 */
const meta: Meta<XuiTextarea> = {
  title: 'Forms/Textarea',
  component: XuiTextarea,
  decorators: [moduleMetadata({ imports: [XuiTextareaImports, FormsModule] })]
};

export default meta;
type Story = StoryObj<XuiTextarea>;

export const Default: Story = {
  render: () => ({
    template: `<textarea xuiTextarea class="w-96" placeholder="Write a note…"></textarea>`
  })
};

export const Small: Story = {
  render: () => ({
    template: `<textarea xuiTextarea size="sm" class="w-96" placeholder="Small"></textarea>`
  })
};

/** Grows to fit as you type; manual resize is off so the two never fight. */
export const AutoResize: Story = {
  render: () => ({
    props: { text: 'This textarea grows to fit.\nAdd more lines and watch it expand.' },
    template: `<textarea xuiTextarea autoResize class="w-96" [(ngModel)]="text"></textarea>`
  })
};
