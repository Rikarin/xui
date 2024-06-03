import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiProgress } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiProgress],
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent {}
