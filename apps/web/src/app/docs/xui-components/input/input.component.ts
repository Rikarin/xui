import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiButtonModule, XuiConfigModule, XuiIcon, XuiInputModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [
    Information,
    Example,
    HighlightModule,
    XuiInputModule,
    XuiIcon,
    XuiButtonModule,
    XuiConfigModule,
    ReactiveFormsModule
  ],
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
  errorControl = new FormControl(null, Validators.required);
  errorInputControl = new FormControl(null, Validators.required);
}
