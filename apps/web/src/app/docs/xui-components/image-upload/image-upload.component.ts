import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiImageUploadModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, ReactiveFormsModule, XuiImageUploadModule],
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  model = new FormGroup({
    first: new FormControl(),
    second: new FormControl()
  });
}
