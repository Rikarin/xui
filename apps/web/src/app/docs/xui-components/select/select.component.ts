import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectItem, XuiSelectModule } from '@xui/components';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { Usages } from '../../components/usage';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiSelectModule, ReactiveFormsModule],
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
