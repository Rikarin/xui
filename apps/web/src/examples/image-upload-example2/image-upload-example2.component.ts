import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiImageUploadModule } from '@xui/components';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload-example2',
  standalone: true,
  imports: [XuiImageUploadModule, ReactiveFormsModule],
  templateUrl: './image-upload-example2.component.html',
  styleUrl: './image-upload-example2.component.scss'
})
export class ImageUploadExample2Component {
  model = new FormGroup({
    first: new FormControl(),
    second: new FormControl()
  });
}
