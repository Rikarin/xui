import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiTextarea } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiTextarea, ReactiveFormsModule],
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent {
  textAreaControl = new FormControl('Loaded text', Validators.required);
}
