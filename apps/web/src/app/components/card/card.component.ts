import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  code = `
<xui-card title="foobar" [extra]="extra" [actions]="actions">Just like this</xui-card>

<ng-template #extra>
  button here
</ng-template>

<ng-template #actions>
  Save Discard
</ng-template>`;

  constructor() {}

  ngOnInit() {}
}
