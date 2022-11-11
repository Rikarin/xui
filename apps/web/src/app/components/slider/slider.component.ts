import { Component, OnInit } from '@angular/core';
import { SliderMark } from 'xui';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
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

  constructor() {}

  ngOnInit(): void {}
}
