import { Component, OnInit } from '@angular/core';
import { delay, XuiButtonComponent } from 'xui';
import { Usage } from '../usage';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  work = async () => {
    await delay(2000);
    return Math.random() >= 0.5;
  };

  usage: Usage[] = [
    {
      param: 'xSize',
      description: 'Size of a button',
      type: "'sm' | 'md' | 'lg' | string",
      default: 'md'
    },
    {
      param: 'xType',
      description: 'Type of a button',
      type: "'normal' | 'dashed' | 'stroked' | 'raised' | 'fab' | 'icon' | string",
      default: 'normal'
    },
    {
      param: 'xColor',
      description: 'Color of a button',
      type: "'primary' | 'primary-alt' | 'secondary' | 'error' | 'neutral' | 'minimal' | string",
      default: 'primary'
    },
    {
      param: 'disabled',
      description: 'Disable button',
      type: 'boolean'
    },
    {
      param: 'xClick',
      description: 'Provides async way to execute an action and shows progress',
      type: '() => Promise<boolean>'
    },
    {
      param: 'xStateDelay',
      description: 'Delay for how long is async state result shown',
      type: 'number',
      default: '5000'
    }
  ];
}
