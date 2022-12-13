import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  isPreview = true;
  isEditing = false;

  changeMode(preview: boolean) {
    this.isPreview = preview;
    console.log('preview', preview);
  }
}
