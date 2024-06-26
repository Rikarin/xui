import { Component } from '@angular/core';
import { SliderMark, XuiButtonModule, XuiSlider } from '@xui/components';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiButtonModule, XuiSlider, ReactiveFormsModule],
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
