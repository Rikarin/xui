import { Component, Input } from '@angular/core';
import { Method, Usage } from './usage';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { CdkTableModule } from '@angular/cdk/table';
import { XuiCardModule } from '@xui/components';
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  imports: [CdkTableModule, XuiCardModule, CommonModule],
  selector: 'app-usage',
  templateUrl: 'usages.html',
  styleUrls: ['usages.scss']
})
export class Usages {
  displayedColumns: string[] = [];
  dataSource = new UsageDataSource();

  @Input()
  get usage() {
    return this.dataSource.data.value as Usage[];
  }

  set usage(value: Usage[]) {
    this.displayedColumns = ['param', 'type', 'default', 'description'];
    this.dataSource.data.next(value);
  }

  @Input()
  get methods() {
    return this.dataSource.data.value as Method[];
  }

  set methods(value: Method[]) {
    this.displayedColumns = ['property', 'description', 'params', 'return'];
    this.dataSource.data.next(value);
  }
}

export class UsageDataSource extends DataSource<Usage | Method> {
  data = new BehaviorSubject<Usage[] | Method[]>([]);

  connect(): Observable<Usage[] | Method[]> {
    return this.data;
  }

  disconnect() {
    // empty
  }
}
