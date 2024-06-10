import { Component } from '@angular/core';
import { XuiImageUploadModule } from '@xui/components';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload-example1',
  standalone: true,
  imports: [XuiImageUploadModule, ReactiveFormsModule],
  templateUrl: './image-upload-example1.component.html',
  styleUrl: './image-upload-example1.component.scss'
})
export class ImageUploadExample1Component {
  model = new FormGroup({
    first: new FormControl(),
    second: new FormControl()
  });
}
