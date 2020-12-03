import { Component, OnInit } from '@angular/core';

// FIXME: export delay from xui
import { delay } from 'libs/xui/src/lib/util/delay';

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
    // wait for 2 secs, then randomly return true/false
  };
}
