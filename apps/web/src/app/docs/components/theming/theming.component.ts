import { Component } from '@angular/core';
import { STYLE_SCSS } from '../../../../templates/angular';
import { HighlightModule } from 'ngx-highlightjs';
import { Example } from '../example';
import { XuiTooltipModule } from '@xui/components';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  standalone: true,
  imports: [HighlightModule, HighlightLineNumbers, Example, XuiTooltipModule],
  selector: 'app-theming',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.scss']
})
export class ThemingComponent {
  code = STYLE_SCSS;
}
