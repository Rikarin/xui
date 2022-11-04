import { Component, Input, OnInit } from '@angular/core';
import { Usage } from './usage';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss']
})
export class UsageComponent implements OnInit {
  displayedColumns: string[] = ['param', 'description', 'type', 'default'];
  dataSource = new UsageDataSource();

  @Input()
  get usage() {
    return this.dataSource.data.value;
  }

  set usage(value: Usage[]) {
    this.dataSource.data.next(value);
  }

  constructor() {}

  ngOnInit(): void {}
}

export class UsageDataSource extends DataSource<Usage> {
  data = new BehaviorSubject<Usage[]>([]);

  connect(): Observable<Usage[]> {
    return this.data;
  }

  disconnect() {}
}
