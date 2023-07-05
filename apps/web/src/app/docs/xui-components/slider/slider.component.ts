import { Component } from '@angular/core';
import { SliderMark } from '@xui/components';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  model = new FormControl(50);
  modelDisabled = new FormControl({ value: 0, disabled: true });

  marks: SliderMark[] = [
    {
      label: '10px',
      value: 10
    },
    {
      label: '15px',
      value: 15
    },
    {
      label: '30px',
      value: 30
    },
    {
      label: '20px',
      value: 20,
      color: 'success'
    }
  ];

  percentages = Array.from(Array(11).keys()).map(x => ({
    label: `${x * 10}%`,
    value: x * 10
  }));

  percentageFormatter = (value: number) => `${value}%`;

  toggle() {
    if (this.model.value) {
      this.model.setValue(0);
    } else {
      this.model.setValue(100);
    }
  }
}
