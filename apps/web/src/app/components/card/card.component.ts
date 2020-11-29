import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  code = `<xui-card title="foobar" [extra]="extra" [actions]="actions">Just like this</xui-card>

<ng-template #extra>
  <button xui-button xSize="sm" xColor="primary">More</button>
</ng-template>

<ng-template #actions>
  <button xui-button xType="raised" xColor="primary">Save</button>
  <button xui-button xColor="destructive">Discard</button>
</ng-template>
`;

  constructor() {}

  ngOnInit() {}
}
