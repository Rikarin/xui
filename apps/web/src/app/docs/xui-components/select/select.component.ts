import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectItem } from '@xui/components';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  model = new FormControl('option1');
  model2 = new FormControl(2);

  items: SelectItem[] = [
    {
      label: 'First Item',
      value: 1
    },
    {
      label: 'Second Item',
      value: 2
    },
    {
      label: 'Third Item',
      value: 3
    }
  ];
}
