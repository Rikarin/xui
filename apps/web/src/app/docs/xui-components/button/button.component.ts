import { Component } from '@angular/core';
import { delay } from '@xui/components';
import { Usage } from '../../components/usage';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
  // encapsulation: ViewEncapsulation.Emulated
})
export class ButtonComponent {
  counter = 0;
  usage: Usage[] = [
    {
      param: '[size]',
      description: 'Size of a button',
      type: "'sm' | 'md' | 'lg'",
      default: 'md'
    },
    {
      param: '[type]',
      description: 'Type of a button',
      type: "'normal' | 'dashed' | 'stroked' | 'raised' | 'fab' | 'icon'",
      default: 'normal'
    },
    {
      param: '[color]',
      description: 'Color of a button',
      type: "'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'minimal",
      default: 'primary'
    },
    {
      param: '[disabled]',
      description: 'Disable a button',
      type: 'boolean'
    },
    {
      param: '(onClick)',
      description: 'Provides async way to execute an action and shows progress',
      type: '() => Promise<boolean>'
    },
    {
      param: '[stateDelay]',
      description: 'Delay for how long is async state result shown',
      type: 'number',
      default: '5000'
    },
    {
      param: '[shine]',
      description: 'Add a nice shine to the button',
      type: 'boolean'
    }
  ];

  work = async () => {
    await delay(2000);
    return Math.random() >= 0.5;
  };

  clickOnDisabled() {
    alert('foo bar');
  }
}
