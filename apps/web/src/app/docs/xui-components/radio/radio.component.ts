import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { Usages } from '../../components/usage';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiRadioModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiRadioModule],
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss']
})
export class RadioComponent {}
