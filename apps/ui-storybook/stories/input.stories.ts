import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { XuiButtonDirective } from '@xui/button';
import { XuiInputDirective, XuiInputImports } from '@xui/input';
import { XuiLabelDirective } from '@xui/label';

export default {
  title: 'Input',
  component: XuiInputDirective,
  tags: ['autodocs'],
  args: {
    color: 'dark'
  },
  argTypes: {
    color: {
      options: ['dark', 'light'],
      control: {
        type: 'select'
      }
    }
  },
  decorators: [
    moduleMetadata({
      imports: [XuiInputImports, XuiLabelDirective, XuiButtonDirective]
    })
  ]
} as Meta<XuiInputDirective>;

type Story = StoryObj<XuiInputDirective>;

export const Default: Story = {
  render: ({ ...args }) => ({
    props: args,
    template: `
      <label xuiLabel class="grid gap-1.5 w-80">
        E-Mail:
        <input xuiInput error="true" type="email" placeholder="Email" value="Foo Bar" ${argsToTemplate(args)} />
      </label>
      <div xuiInputError>Invalid E-mail!</div>

      <label xuiLabel class="grid gap-2 w-80 mt-4">
        Small:
        <input xuiInput size="sm" type="email" placeholder="Email" ${argsToTemplate(args)} />
      </label>

<!--      <label xuiLabel class="grid gap-2 w-80 mt-4">-->
<!--        Large:-->
<!--        <input xuiInput size="lg" type="email" placeholder="Email" />-->
<!--      </label>-->

      <div class="grid w-80 relative mt-4">
        <input xuiInput type="email" placeholder="Email" />
        <button xuiButton class="absolute bottom-1.5 right-1.5 h-8" size="sm" type="button">Search!</button>
      </div>

<!--      <div class="grid w-80 relative mt-4">-->
<!--        <input xuiInput size="lg" type="email" placeholder="Email" />-->
<!--        <button xuiButton class="absolute bottom-1 right-1" size="sm" type="button">Search!</button>-->
<!--      </div>-->

      <div class="grid w-80 relative mt-4">
        <input xuiInput class="pl-22" type="email" placeholder="Email" />
        <button xuiButton class="absolute bottom-1.5 left-1.5" size="sm" type="button">Search!</button>
      </div>

      <div class="grid w-80 relative mt-4">
        <span class="absolute left-2 top-2 font-semibold">https://</span>
        <input xuiInput class="pl-17" type="email" placeholder="Website" />
        <span class="absolute right-2 top-2 font-semibold">.io</span>
      </div>


      <input xuiInput class="mt-4" type="file" placeholder="File" ${argsToTemplate(args)} />
		`
  })
};
