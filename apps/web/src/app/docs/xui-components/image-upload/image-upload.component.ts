import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example, FileType } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { ImageUploadExample1Component } from '../../../../examples/image-upload-example1/image-upload-example1.component';
import { ImageUploadExample2Component } from '../../../../examples/image-upload-example2/image-upload-example2.component';
import { Usage, Usages } from '../../components/usage';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, ImageUploadExample1Component, ImageUploadExample2Component, Usages],
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  readonly example1 = {
    'image-upload-example1': FileType.Component
  };

  readonly example2 = {
    'image-upload-example2': FileType.Component
  };

  usage: Usage[] = [
    {
      param: 'type',
      description: 'Type of the image.',
      type: '"square" | "round"',
      default: '"square"'
    },
    { param: 'aspectRatio', description: 'Aspect ratio of the image.', type: 'number', default: '1' },
    {
      param: 'hoverLabel',
      description: 'Label to show on hover.',
      type: 'string',
      default: 'xui.image_upload.change_image'
    },
    { param: 'disabled', description: 'Disable the image upload.', type: 'boolean', default: 'false' }
  ];
}
