import { Component, OnInit } from '@angular/core';
import { delay } from 'xui';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  work = async () => {
    await delay(2000);
    return Math.random() > 0.5;
  };
}
