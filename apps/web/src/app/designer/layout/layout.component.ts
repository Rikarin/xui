import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  isPreview = false;
  isEditing = false;

  ngOnInit() {
    // var scss = '$someVar: 123px; .some-selector { width: $someVar; }';
    //
    // Sass.compile(scss, function(result: any) {
    //   console.log(result);
    // });
  }

  changeMode(preview: boolean) {
    this.isPreview = preview;
    console.log('preview', preview);
  }
}

declare namespace Sass {
  function compile(script: string, result: any): void;
}
