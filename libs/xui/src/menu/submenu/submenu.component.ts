import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { InputBoolean } from '../../util/convert';
import { XuiSubmenuService } from '../submenu.service';

@Component({
  selector: 'xui-submenu',
  exportAs: 'xuiSubMenu',
  providers: [XuiSubmenuService],
  templateUrl: './submenu.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // '[style.paddingLeft.px]': 'paddingLeft'
  }
})
export class XuiSubMenuComponent implements OnInit {
  @Input() title: string;
  @Input() icon: string;
  @Input() @InputBoolean() open = false;
  @Output() readonly openChange: EventEmitter<boolean> = new EventEmitter();

  paddingLeft = this.submenuService.level * 24;

  constructor(private submenuService: XuiSubmenuService) {}

  ngOnInit() {
    console.log('padding left', this.paddingLeft);
  }

  toggleSubmenu() {
    this.open = !this.open;
    this.openChange.emit();
  }
}
