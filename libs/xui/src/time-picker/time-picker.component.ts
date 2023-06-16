import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-time-picker',
  templateUrl: './time-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiTimePickerComponent {}
