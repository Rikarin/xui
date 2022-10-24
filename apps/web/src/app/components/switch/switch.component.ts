import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchComponent implements OnInit {
  asyncSwitch = new FormControl(false);

  constructor() {
    setInterval(() => {
      this.asyncSwitch.setValue(!this.asyncSwitch.value);
    }, 1000);
  }

  ngOnInit(): void {}
}
