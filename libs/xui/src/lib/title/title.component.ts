import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { XuiTitleService } from './title.service';
// import { LocalStorage } from '../../local-storage';

@Component({
  selector: 'xui-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
})
export class XuiTitleComponent implements OnInit, OnDestroy {
  private _interval: number;

  @Input() title: string;
  @Input() autoRefresh = false;

  // @LocalStorage
  autoRefreshEnabled = null;
  // @LocalStorage
  selected = null;

  constructor(private titleService: XuiTitleService) {}

  ngOnInit() {
    if (!this.selected) {
      this.selected = 300000;
    }

    if (this.autoRefreshEnabled == null) {
      this.autoRefreshEnabled = true;
    }

    this.setup();
  }

  ngOnDestroy() {
    clearInterval(this._interval);
  }

  onChangeAutorefresh(value) {
    this.autoRefreshEnabled = value.checked;
    this.setup();
  }

  onChangeSelect(value) {
    this.selected = value;
    this.setup();
  }

  private setup() {
    clearInterval(this._interval);

    if (this.autoRefreshEnabled && this.autoRefresh) {
      this._interval = setInterval(() => {
        this.titleService.tick();
      }, this.selected);
    }
  }
}
