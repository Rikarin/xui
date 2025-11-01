import type { Meta, StoryObj } from '@storybook/angular';
import { XuiButton } from '@xui/button';
import { XuiSonnerComponent, XuiSonnerImports } from '@xui/sonner';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'sonner-default-test',
  imports: [XuiSonnerImports, XuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-sonner />
    <button xuiButton (click)="showToast()">Open Toast</button>
  `
})
export class SonnerDefaultTestComponent {
  showToast() {
    toast.error('Hello World!');
  }
}

export default {
  title: 'Sonner',
  component: SonnerDefaultTestComponent,
  tags: ['autodocs']
} as Meta<XuiSonnerComponent>;

type Story = StoryObj<XuiSonnerComponent>;

export const Default: Story = {
  render: () => ({
    template: `<sonner-default-test />`
  })
};
